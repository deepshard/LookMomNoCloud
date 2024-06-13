import { Dispatch, createContext, useContext, useState } from "react";
import { TSysInfo } from "../types/schemas";

interface SystemInfoHardwareCarouselContextProps {
    sysInfo: TSysInfo | null
    setSysInfo: Dispatch<React.SetStateAction<TSysInfo | null>>
    selection: "memory" | "disk"
    setSelection: Dispatch<React.SetStateAction<"memory" | "disk">>
}

const SystemInfoHardwareCarouselContext = createContext<SystemInfoHardwareCarouselContextProps>({
    sysInfo: null,
    setSysInfo: () => {},
    selection: "memory",
    setSelection: () => {}
})
const SystemInfoHardwareCarouselProvider = ({ children }) => {

  const [sysInfo, setSysInfo] = useState<TSysInfo | null>(null);
  const [selection, setSelection] = useState<"memory" | "disk">("memory");

  return <SystemInfoHardwareCarouselContext.Provider value={{ sysInfo, setSysInfo, selection, setSelection  }}>{children}</SystemInfoHardwareCarouselContext.Provider>;
};

export const useSystemInfoHardwareCarouselContext = () => useContext(SystemInfoHardwareCarouselContext);
export default SystemInfoHardwareCarouselProvider;
