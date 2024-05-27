import { TModel, TSysInfo } from 'src/types/schemas';
import {create} from 'zustand';

interface State {
    sysInfo: TSysInfo | null;
    addSysInfo: (info: TSysInfo) => void;
    highlights: TModel[];
    setHighlights: (highlights: TModel[]) => void;
    clearData: () => void;
}

export const useStore = create<State>(set => ({
  sysInfo: null,
  addSysInfo: (info) => set(state => ({ sysInfo: info })),
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  clearData: () => set({ sysInfo: null }) // Method to clear all data
}));