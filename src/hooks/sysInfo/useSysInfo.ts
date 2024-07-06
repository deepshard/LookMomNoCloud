import { useEffect, useRef } from 'react';
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

const MAX_RETRIES = Infinity;
const INITIAL_RETRY_DELAY = 3000; // 1 second

const useSysInfo = (
  { rootUrl, addSysInfo, EventSourceFactory }: SysInfoHookProps
) => {

  const retryCount = useRef(0);
  const retryDelay = useRef(INITIAL_RETRY_DELAY);


  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectEventSource = () => {
      eventSource = createEventSource(EventSourceFactory, `${rootUrl}/sysinfo`);

      eventSource.onmessage = (event) => handleEventSourceMessage(event, addSysInfo);

      eventSource.onerror = (error: Event) => {
        console.error("EventSource error:", error);
        eventSource?.close();

        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;

          setTimeout(() => {
            retryDelay.current *= 2; // Exponential backoff
            connectEventSource();
          }, retryDelay.current);
        } else {
          console.error("Max retries reached. Giving up on reconnection.");
        }
      };

      eventSource.onopen = () => {
        retryCount.current = 0;
        retryDelay.current = INITIAL_RETRY_DELAY;
      };
    };

    connectEventSource();

    return () => {
      eventSource?.close();
    };
  }, [rootUrl, addSysInfo, EventSourceFactory]);

};

export default useSysInfo;
export { createEventSource, handleEventSourceMessage, handleEventSourceError };