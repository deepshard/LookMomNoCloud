import { createContext, useContext, useEffect } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetHighlights, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";
import Analytics from "../types/Analytics";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { TruffleUpdateInfo } from "../ota";

interface AppWrapperContextType {
  isLoadingMyModels: boolean;
}

const AppWrapperContext = createContext<AppWrapperContextType>({
  isLoadingMyModels: false,
});

Analytics.init("a45767d32d620a6ba48640ccec2bf2f3");

const AppWrapperProvider = ({ children }) => {
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const { addUpdateInfo, addSysInfo, sysInfo, setDownloads, setHighlights } = useAppStore();
  const { data: highlights } = useGetHighlights(sysInfo);
  const navigate = useNavigate();

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

    const handleInitializationCheck = (checkResult: any) => {
      // If initialization is required, navigate to the initialization page
      // otherwise check for updates immediately
      if (checkResult.required) {
        navigate("/initialization");
      } else {
        //@ts-ignore
        window.ipc.checkForUpdates();
      }
    };

    //@ts-ignore
    window.ipc.onUpdateAvailable(handleUpdateAvailable);

    //@ts-ignore
    window.ipc.onInitializationCheck(handleInitializationCheck);

    return () => {
      //@ts-ignore
      window.ipc.onUpdateAvailable(() => {});

      //@ts-ignore
      window.ipc.onInitializationCheck(() => {});
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
    if (sysInfo) {
      if (highlights) {
        setHighlights(highlights);
      }
    }
  }, [highlights, sysInfo]);
  return <AppWrapperContext.Provider value={{ isLoadingMyModels }}>{children}</AppWrapperContext.Provider>;
};

export const useAppWrapper = () => {
  return useContext(AppWrapperContext);
};
export default AppWrapperProvider;
