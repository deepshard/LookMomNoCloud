import { TModel, TSysInfo } from "../types/schemas";
import { create } from "zustand";

interface State {
  sysInfo: TSysInfo | null;
  addSysInfo: (info: TSysInfo) => void;
  highlights: TModel[];
  setHighlights: (highlights: TModel[]) => void;
  downloads: { [key: string]: TModel };
  setDownloads: (model: TModel) => void;
  clearData: () => void;
}

export const useStore = create<State>((set) => ({
  sysInfo: null,
  addSysInfo: (info) => set((state) => ({ sysInfo: info })),
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  downloads: {},
  setDownloads: (model) => set((state) => ({ downloads: { ...state.downloads, [model.id]: model } })),
  clearData: () => set({ sysInfo: null, highlights: [] }), // Method to clear all data
}));
