import { createContext, useContext, useEffect, useLayoutEffect } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetHighlights, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";
import Analytics from "../types/Analytics";
import { v4 as uuidv4 } from 'uuid';
import mixpanel from "mixpanel-browser";


const AppWrapperContext = createContext({
  isLoadingMyModels: false
});

Analytics.init("a45767d32d620a6ba48640ccec2bf2f3");

const AppWrapperProvider = ({ children }) => {
  const { data: myModels, isLoading: isLoadingMyModels } = useGetMyModels();
  const { data: highlights } = useGetHighlights();
  const { addSysInfo, setDownloads, setHighlights } = useAppStore();

  useEffect(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    Analytics.identify(deviceId)
  }, [])
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
  return <AppWrapperContext.Provider value={{ isLoadingMyModels }}>{children}</AppWrapperContext.Provider>;
};

export const useAppWrapper = () => {
  return useContext(AppWrapperContext);
}
export default AppWrapperProvider;
