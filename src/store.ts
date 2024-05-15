import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface DownloadProgress {
    [key: string]: number
}

interface MemoryUsage {
    [key: number]: number
}

interface State {
    downloadProgress: DownloadProgress
    memoryUsage: MemoryUsage
    setDownloadProgress: (data: { model: string, progress: number}) => void
    setMemoryUsage: (data: { pid: number, usage: number }) => void
}

const useStore = create<State>()(
    persist(
        (set) => ({
            downloadProgress: {},
            memoryUsage: {},
            setDownloadProgress: (data) => {
                console.log(`Setting download progress for model ${data.model}: ${data.progress}%`);
                set((s) => ({ downloadProgress: {...s.downloadProgress, [data.model]: data.progress }}));
            },
            setMemoryUsage: (data) => {
                console.log(`Setting memory usage for pid ${data.pid}: ${data.usage}`);
                set((s) => ({ memoryUsage: {...s.memoryUsage, [data.pid]: data.usage }}));
            },
        }),
        {
            name: 'store',
        }
    )
)

export default useStore

