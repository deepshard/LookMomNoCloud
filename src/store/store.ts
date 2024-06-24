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
  onDeleteModel: (model: TModel) => void;
  clearData: () => void;
}

export const useStore = create<State>((set) => ({
  sysInfo: null,
  addSysInfo: (info) => set((store) => {
    const models = info.resources.models.map((model) => {
      const m = store.downloads[model.id];
      if (m) {
        return { ...m, ...model };
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
    const stateCp = { ...state }
    downloadedModels.forEach((model) => {
      stateCp.downloads = { ...stateCp.downloads, [model.id]: model }
      const hModelIndex = stateCp.highlights.findIndex((highlight) => highlight.id === model.id)
      if (hModelIndex > -1) {
        stateCp.highlights[hModelIndex] = { ...stateCp.highlights[hModelIndex], ...model }
      }
    })
    return { ...stateCp, downloads: stateCp.downloads, highlights: stateCp.highlights }
  }),
  updateModels: (model) => set((state) => {
    const highlights = state.highlights.map((highlight) => {
      if (highlight.id === model.id) {
        return { ...highlight, ...model }
      }
      return highlight
    })

    return {
      ...state,
      downloads: { ...state.downloads, [model.id]: { ...state.downloads[model.id], ...model } },
      highlights
    }
  }),
  onDeleteModel: (model) => set((state) => {
    const stateCp = { ...state }
    delete stateCp.downloads[model.id]
    return {
      ...stateCp,
      downloads: { ...stateCp.downloads },
    }
  }),
  clearData: () => set((state) => ({ ...state, sysInfo: null, highlights: [], downloads: {} })), // Method to clear all data
}));

export const useAppStore = () => useStore((state) => state)