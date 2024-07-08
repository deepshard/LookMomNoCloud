import { createContext, useContext, useEffect, useRef } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetHighlights, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";
import Analytics from "../types/Analytics";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { TruffleUpdateInfo } from "../ota";
import { useInView } from "react-intersection-observer";

interface AppWrapperContextType {
  isLoadingMyModels: boolean;
  playgroundRef: any;
  playgroundInView: boolean;
  playgroungTarget?: Element ;
}

const AppWrapperContext = createContext<AppWrapperContextType>({
  isLoadingMyModels: false,
  playgroundRef: null,
  playgroundInView: false,
  playgroungTarget: undefined,
});

Analytics.init("a45767d32d620a6ba48640ccec2bf2f3");

const AppWrapperProvider = ({ children }) => {
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const { data: highlights } = useGetHighlights();
  const { addUpdateInfo, addSysInfo, setDownloads, setHighlights } = useAppStore();
  const navigate = useNavigate();
  // const playgroundRef = useRef<HTMLDivElement>(null);
  const {ref, inView, entry} = useInView({
    threshold: 0.95,
  })

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
    if (inView) {
      const playground = entry?.target.getElementsByClassName("playground")[0];
      if (playground) {
        // @ts-ignore
        playground.style.position = "relative";
      }

    }
  }, [inView]);
  return <AppWrapperContext.Provider value={{ isLoadingMyModels, playgroundRef: ref, playgroungTarget: entry?.target, playgroundInView: inView }}>{children}</AppWrapperContext.Provider>;
};

export const useAppWrapper = () => {
  return useContext(AppWrapperContext);
};
export default AppWrapperProvider;
