import { useEffect } from 'react';
import { TSysInfo } from 'src/types/schemas';

interface SysInfoHookProps {
  rootUrl: string;
  addSysInfo: (info: TSysInfo) => void;
  EventSourceFactory?: EventSource | any;
}
const useSysInfo = (
  { rootUrl, addSysInfo, EventSourceFactory=EventSource }: SysInfoHookProps
) => {

  useEffect(() => {
    const eventSource = new EventSource(rootUrl + "/sysinfo");

    eventSource.onmessage = (event) => {
      const newSysInfo = JSON.parse(event.data);
      addSysInfo(newSysInfo);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

};

export default useSysInfo;