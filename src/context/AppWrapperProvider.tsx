import { createContext, useContext, useEffect } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetHighlights, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";
import Analytics from "../types/Analytics";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { TruffleUpdateInfo } from "../ota";
import useModelActions from "../hooks/modelActions/useModelActions";

const AppWrapperContext = createContext({
  isLoadingMyModels: false,
});

Analytics.init("a45767d32d620a6ba48640ccec2bf2f3");

const AppWrapperProvider = ({ children }) => {
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const { data: highlights } = useGetHighlights();
  const { addUpdateInfo, addSysInfo, sysInfo, setDownloads, setHighlights, updateModels } = useAppStore();
  const navigate = useNavigate();
  const { stopModel } = useModelActions();

  useEffect(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    Analytics.identify(deviceId);

    const handleUpdateAvailable = (newUpdateInfo: TruffleUpdateInfo) => {
      addUpdateInfo(newUpdateInfo);
    };

    const handleInitializationRequired = () => {
      navigate("/initialization");
    };

    //@ts-ignore
    window.ipc.onUpdateAvailable(handleUpdateAvailable);

    //@ts-ignore
    window.ipc.onInitializationRequired(handleInitializationRequired);

    //@ts-ignore
    window.ipc.checkForUpdates();

    //@ts-ignore
    window.ipc.onTrayModelStopped((model) => {
      stopModel(model).then(() => {
        updateModels({
          ...model,
          status: "STOPPED",
        });
      });
    });

    return () => {
      //@ts-ignore
      window.ipc.onUpdateAvailable(() => {});

      //@ts-ignore
      window.ipc.onInitializationRequired(() => {});
    };
  }, []);
  useSysInfo({
    rootUrl: LOCAL_ROOT_URL,
    addSysInfo,
    EventSourceFactory: EventSource,
  });

  useEffect(() => {
    if (myModels) {
      setDownloads(myModels);
    }
  }, [myModels]);

  useEffect(() => {
    if (highlights) {
      setHighlights(highlights);
    }
  }, [highlights]);

  useEffect(() => {
    // @ts-ignore
    window.ipc.updateRunningModels(sysInfo?.resources.models, () => {});
  }, [sysInfo?.resources.models]);
  return <AppWrapperContext.Provider value={{ isLoadingMyModels }}>{children}</AppWrapperContext.Provider>;
};

export const useAppWrapper = () => {
  return useContext(AppWrapperContext);
};
export default AppWrapperProvider;
