import { TModel, TSysInfo } from "../types/schemas";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  settings: { 
    collectData: boolean;
    [key: string]: any 
  };
  setSetting: (key: string, value: boolean) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      sysInfo: null,
      addSysInfo: (info) =>
        set((store) => {
          const models = info.resources.models.map((model) => {
            const m = store.downloads[model.id];
            if (m) {
              return { ...m, ...model };
            }
            return model;
          });
          info.resources.models = models;
          return { sysInfo: info };
        }),
      highlights: [],
      setHighlights: (highlights) => set({ highlights }),
      downloads: {},
      setDownloads: (downloadedModels) =>
        set((state) => {
          const stateCp = { ...state };
          downloadedModels.forEach((model) => {
            stateCp.downloads = { ...stateCp.downloads, [model.id]: model };
            const hModelIndex = stateCp.highlights.findIndex((highlight) => highlight.id === model.id);
            if (hModelIndex > -1) {
              stateCp.highlights[hModelIndex] = { ...stateCp.highlights[hModelIndex], ...model };
            }
          });
          return { ...stateCp, downloads: stateCp.downloads, highlights: stateCp.highlights };
        }),
      updateModels: (model) =>
        set((state) => {
          const stateCp = { ...state };
          const highlights = stateCp.highlights.map((highlight) => {
            if (highlight.id === model.id) {
              return { ...highlight, ...model };
            }
            return highlight;
          });

          return {
            ...state,
            downloads: { ...state.downloads, [model.id]: { ...state.downloads[model.id], ...model } },
            highlights,
          };
        }),
      onDeleteModel: (model) =>
        set((state) => {
          const stateCp = { ...state };
          delete stateCp.downloads[model.id];
          return {
            ...stateCp,
            downloads: { ...stateCp.downloads },
          };
        }),
      settings: {
        collectData: true
      },
      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
      clearData: () => set((state) => ({ 
        ...state, 
        sysInfo: null, 
        highlights: [], 
        downloads: {},
        // Note: We're not clearing settings here
      })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export const useAppStore = () => useStore((state) => state);
