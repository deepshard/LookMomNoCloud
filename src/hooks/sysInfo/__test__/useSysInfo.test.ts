import { act, renderHook } from '@testing-library/react';
import useSysInfo, { createEventSource, handleEventSourceMessage } from '../useSysInfo';


describe('useSysInfo', () => {
  let mockEventSource;
  const addSysInfo = jest.fn();
  beforeAll(() => {
    mockEventSource = jest.fn().mockImplementation(() => {
      let onmessage: (event: MessageEvent) => void = jest.fn();
      let onerror: (event: {error: Error}) => void = jest.fn();
      const close = jest.fn();
      
      // Triggering messages or errors
      const triggerMessage = (data) => {
        onmessage && onmessage(new MessageEvent('message', {data}));
      };
      const triggerError = (error) => {
        onerror && onerror({ error });
      };
  
      return { 
        addEventListener: jest.fn((type, handler) => {
            if (type === 'message') onmessage = handler;
            if (type === 'error') onerror = handler;
          }), 
        removeEventListener: jest.fn(), 
        close, 
        triggerMessage, 
        triggerError,
        onmessage,
        onerror
      };
    });
  });


  it('receives and processes system info', () => {
    const { unmount } = renderHook(() =>
      useSysInfo({
        rootUrl: "http://example.com",
        addSysInfo,
        EventSourceFactory: mockEventSource
      })
    );

    expect(mockEventSource).toHaveBeenCalledTimes(1);
    expect(mockEventSource).toHaveBeenCalledWith("http://example.com/sysinfo");
    
    unmount();
  })

  it('calls onmessage when message is received', () => {
    const evSource = mockEventSource()
    act(() => {
      evSource.triggerMessage('{"data": "hello"}');
    })

    expect(evSource.onmessage).toHaveBeenCalledTimes(1);
  })

  it('calls addSysInfo when message is received', () => {
    handleEventSourceMessage(new MessageEvent('message', {data: '{"data": "hello"}'}), addSysInfo);

    expect(addSysInfo).toHaveBeenCalledTimes(1);
    expect(addSysInfo).toHaveBeenCalledWith({data: "hello"});
  })

  test('initializes EventSource with correct URL', () => {
    createEventSource(mockEventSource, "http://example.com");
    expect(mockEventSource).toHaveBeenCalledWith("http://example.com");
  });

});