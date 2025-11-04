import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Tab interface
export interface Tab {
  id: string;
  name: string;
  content: any; // Blockly JSON object
}

// Store shape with both state and actions
export type AppState = {
  ip: string | null;
  showSettings: boolean;
  showPreview: boolean;
  isExecuting: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  
  setIp: (ip: string | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  toggleShowSettings: () => void;
  setIsExecuting: (executing: boolean) => void;
  toggleIsExecuting: () => void;
  
  // Tab management
  createNewTab: (name: string, initialContent?: any) => void;
  deleteTab: (id: string) => void;
  updateTab: (id: string, content: any) => void;
  renameTab: (id: string, newName: string) => void;
  setActiveTab: (id: string) => void;
  getTab: (id: string) => Tab | undefined;
  getActiveTab: () => Tab | undefined;
  reorderTabs: (startIndex: number, endIndex: number) => void;
};

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ip: "",
        showSettings: false,
        showPreview: false,
        isExecuting: false,
        tabs: [{ id: "main", name: "Main", content: null }], // Initialize with default tab
        activeTabId: "main",
        
        setIp: (ip) => set({ ip }),
        setShowSettings: (show) => set({ showSettings: show }),
        setShowPreview: (show) => set({ showPreview: show }),
        toggleShowSettings: () => set({ showSettings: !get().showSettings }),
        setIsExecuting: (executing) => set({ isExecuting: executing }),
        toggleIsExecuting: () => set({ isExecuting: !get().isExecuting }),
        
        // Tab management methods
        createNewTab: (name, initialContent = null) => {
          const { tabs } = get();
          const id = `tab_${Date.now()}`; // Generate unique ID
          const newTab: Tab = { id, name, content: initialContent };
          set({ 
            tabs: [...tabs, newTab],
            activeTabId: id 
          });
        },
        
        deleteTab: (id) => {
          const { tabs, activeTabId } = get();
          const tabIndex = tabs.findIndex(tab => tab.id === id);
          
          if (tabIndex === -1) {
            console.warn(`Tab with id "${id}" does not exist`);
            return;
          }
          
          const newTabs = tabs.filter(tab => tab.id !== id);
          
          // If deleting the active tab, switch to another tab
          let newActiveTabId = activeTabId;
          if (activeTabId === id) {
            if (newTabs.length > 0) {
              // Switch to the previous tab, or first tab if deleting the first one
              const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
              newActiveTabId = newTabs[newIndex]?.id || null;
            } else {
              newActiveTabId = null;
            }
          }
          
          set({ tabs: newTabs, activeTabId: newActiveTabId });
        },
        
        updateTab: (id, content) => {
          const { tabs } = get();
          const tabIndex = tabs.findIndex(tab => tab.id === id);
          
          if (tabIndex === -1) {
            console.warn(`Tab with id "${id}" does not exist`);
            return;
          }
          
          const newTabs = [...tabs];
          newTabs[tabIndex] = { ...newTabs[tabIndex], content };
          set({ tabs: newTabs });
        },
        
        renameTab: (id, newName) => {
          const { tabs } = get();
          const tabIndex = tabs.findIndex(tab => tab.id === id);
          
          if (tabIndex === -1) {
            console.warn(`Tab with id "${id}" does not exist`);
            return;
          }
          
          const newTabs = [...tabs];
          newTabs[tabIndex] = { ...newTabs[tabIndex], name: newName };
          set({ tabs: newTabs });
        },
        
        setActiveTab: (id) => {
          const { tabs } = get();
          const tab = tabs.find(tab => tab.id === id);
          
          if (!tab) {
            console.warn(`Tab with id "${id}" does not exist`);
            return;
          }
          
          set({ activeTabId: id });
        },
        
        getTab: (id) => {
          return get().tabs.find(tab => tab.id === id);
        },
        
        getActiveTab: () => {
          const { tabs, activeTabId } = get();
          return tabs.find(tab => tab.id === activeTabId);
        },
        
        reorderTabs: (startIndex, endIndex) => {
          const { tabs } = get();
          const newTabs = [...tabs];
          const [removed] = newTabs.splice(startIndex, 1);
          newTabs.splice(endIndex, 0, removed);
          set({ tabs: newTabs });
        },
      }),
      {
        name: "app-storage",
        version: 3, // Increment version due to schema change
      }
    ),
    { name: "useAppStore" }
  )
);

export default useAppStore;