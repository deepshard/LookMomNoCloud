import { TModel, TSysInfo } from "../types/schemas";
import { create } from "zustand";

interface State {
  sysInfo: TSysInfo | null;
  addSysInfo: (info: TSysInfo) => void;
  highlights: TModel[];
  setHighlights: (highlights: TModel[]) => void;
  downloads: { [key: string]: TModel };
  setDownloads: (downloadedModels: TModel[]) => void;
  updateModels: (model: TModel) => void;
  clearData: () => void;
}

export const useStore = create<State>((set) => ({
  sysInfo: null,
  addSysInfo: (info) => set((store) => {
    const models = info.resources.models.map((model) => {
      const m = store.downloads[model.id];
      if(m) {
        return {...m, ...model};
      }
      return model
    })
    info.resources.models = models;
    return { sysInfo: info };
  }),
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  downloads: {},
  setDownloads: (downloadedModels) => set((state) => {
    downloadedModels.forEach((model) => {
      state.downloads[model.id] = model
    })

    return { downloads: state.downloads }
  }),
  updateModels: (model) => set((state) => {
    const highlights = state.highlights.map((highlight) => {
      if (highlight.id === model.id) {
        return { ...highlight, ...model }
      }
      return highlight
    })

    return { 
      downloads: { ...state.downloads, [model.id]: { ...state.downloads[model.id], ...model} }, 
      highlights
    }
  }),
  clearData: () => set({ sysInfo: null, highlights: [] }), // Method to clear all data
}));

export const useAppStore = () => useStore((state) => state)