import { useEffect } from 'react';
import { TSysInfo } from '../../types/schemas';

interface SysInfoHookProps {
  rootUrl: string;
  addSysInfo: (info: TSysInfo) => void;
  EventSourceFactory: typeof EventSource;
}

const createEventSource = (EventSourceFactory: typeof EventSource, url: string) => {
  return new EventSourceFactory(url);
};

const handleEventSourceMessage = (event: MessageEvent, addSysInfo: (info: TSysInfo) => void) => {
  const newSysInfo = JSON.parse(event.data);
  addSysInfo(newSysInfo);
};

const handleEventSourceError = (eventSource: EventSource) => (error: Event) => {
  console.error("EventSource error:", error);
  eventSource.close();
};

const useSysInfo = (
  { rootUrl, addSysInfo, EventSourceFactory }: SysInfoHookProps
) => {

  useEffect(() => {
    const eventSource = createEventSource(EventSourceFactory, `${rootUrl}/sysinfo`);

    eventSource.onmessage = (event) => handleEventSourceMessage(event, addSysInfo);
    eventSource.onerror = handleEventSourceError(eventSource);

    return () => {
      eventSource.close();
    };
  }, []);

};

export default useSysInfo;
export { createEventSource, handleEventSourceMessage, handleEventSourceError };