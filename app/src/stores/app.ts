import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Store shape with both state and actions
export type AppState = {
  ip: string | null;
  showSettings: boolean;
  showPreview: boolean;
  isExecuting: boolean;
  setIp: (ip: string | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  toggleShowSettings: () => void;
  setIsExecuting: (executing: boolean) => void;
  toggleIsExecuting: () => void;
};

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ip: "",
        showSettings: false,
        showPreview: false,
        isExecuting: false,
        setIp: (ip) => set({ ip }),
        setShowSettings: (show) => set({ showSettings: show }),
        setShowPreview: (show) => set({ showPreview: show }),
        toggleShowSettings: () => set({ showSettings: !get().showSettings }),
        setIsExecuting: (executing) => set({ isExecuting: executing }),
        toggleIsExecuting: () => set({ isExecuting: !get().isExecuting }),
      }),
      {
        name: "app-storage", // key in storage
        version: 1,
      }
    ),
    { name: "useAppStore" }
  )
);

export default useAppStore;
