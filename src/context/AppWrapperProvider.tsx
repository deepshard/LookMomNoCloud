import { createContext, useEffect } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetHighlights, useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";

const AppWrapperContext = createContext({});

const AppWrapperProvider = ({ children }) => {
  const { data: myModels } = useGetMyModels();
  const { data: highlights, refetch: getHighlights } = useGetHighlights();
  const { addSysInfo, setDownloads, setHighlights, onDeleteModel } = useAppStore();
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
    getHighlights();
  }, [onDeleteModel]);
  return <AppWrapperContext.Provider value={{}}>{children}</AppWrapperContext.Provider>;
};
export default AppWrapperProvider;
