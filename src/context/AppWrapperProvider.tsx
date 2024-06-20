import { createContext, useEffect } from "react";
import useSysInfo from "../hooks/sysInfo/useSysInfo";
import { LOCAL_ROOT_URL } from "../api/client";
import { useGetMyModels } from "../lib/react-query/queriesAndMutations";
import { useAppStore } from "../store/store";

const AppWrapperContext = createContext({});

const AppWrapperProvider = ({ children }) => {
  const { data: myModels } = useGetMyModels();
  const { addSysInfo, setDownloads } = useAppStore();
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
  return <AppWrapperContext.Provider value={{}}>{children}</AppWrapperContext.Provider>;
};
export default AppWrapperProvider;
