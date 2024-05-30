

describe('useInstallModel', () => {
    test('should install model and handle stream', async () => {
        const mockReader = {
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: 'data' })
            .mockResolvedValue({ done: true }),
        };
        const mockResponse = {
          ok: true,
          body: { getReader: jest.fn().mockReturnValue(mockReader) },
        };
        mockFetch.mockResolvedValue(mockResponse);
    
        const { result, waitForNextUpdate } = renderHook(() => useInstallModel({
          fetchFn: mockFetch,
          useStoreHook: () => ({ setDownloads: mockSetDownloads })
        }));
    
        result.current.installModel(fakeModel);
        await waitForNextUpdate();
    
        expect(mockFetch).toHaveBeenCalled();
        expect(mockResponse.body.getReader).toHaveBeenCalled();
        expect(mockSetDownloads).toHaveBeenCalledWith({ ...fakeModel, status: "downloading" });
    });
});