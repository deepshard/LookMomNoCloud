import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
                set((s) => ({ downloadProgress: {...s.downloadProgress, [data.model]: data.progress }}));
            },
            setMemoryUsage: (data) => {
                set((s) => ({ memoryUsage: {...s.memoryUsage, [data.pid]: data.usage }}));
            },
        }),
        {
            name: 'store',
        }
    )
)

export default useStore

