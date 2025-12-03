import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import WSQueue from "../WSQueue";

let wsQueue: WSQueue | null = null;

// File interface - persisted data
export interface File {
  id: string;
  name: string;
  content: any; // Blockly JSON object
  createdAt: number;
  updatedAt: number;
}

// Tab interface - ephemeral views into files
export interface Tab {
  id: string;
  fileId: string; // Reference to a file
}

// Store shape with both state and actions
export type AppState = {
  ip: string | null;
  showSettings: boolean;
  showPreview: boolean;
  isExecuting: boolean;
  isRunning: boolean;
  files: File[];
  tabs: Tab[];
  activeTabId: string | null;
  connectionStatus: "connected" | "disconnected" | "checking" | "unknown";
  pingIntervalId?: number | null;

  init: () => void;
  setIp: (ip: string | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  toggleShowSettings: () => void;
  setIsExecuting: (executing: boolean) => void;
  toggleIsExecuting: () => void;

  // Run/Stop control
  run: () => void;
  stop: () => void;
  reconnect: () => void;

  doPing: () => void;
  queueSend: (data: any) => void;

  // File management
  createFile: (name: string, initialContent?: any) => string; // Returns file ID
  deleteFile: (fileId: string) => void;
  updateFile: (fileId: string, content: any) => void;
  renameFile: (fileId: string, newName: string) => void;
  getFile: (fileId: string) => File | undefined;

  // Tab management
  openTab: (fileId: string) => void; // Opens file in new tab or focuses existing
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  getActiveTab: () => Tab | undefined;
  getActiveFile: () => File | undefined;
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
        isRunning: false,
        files: [
          {
            id: uuidv4(),
            name: "Main",
            content: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        tabs: [],
        activeTabId: null,
        connectionStatus: "unknown",

        init: () => {
          const ip = get().ip;
          if(ip){
            wsQueue = new WSQueue(`ws://${ip}/ws`);
            get().doPing();
          }
          const oldPingIntervalId = get().pingIntervalId;
          if (oldPingIntervalId) {
            clearInterval(oldPingIntervalId);
          }
          const pingIntervalId = setInterval(() => {
            get().doPing();
          }, 30000);
          set({ pingIntervalId });
        },
        setIp: (ip) => {
          set({ ip })
          get().reconnect();
        },
        setShowSettings: (show) => set({ showSettings: show }),
        setShowPreview: (show) => set({ showPreview: show }),
        toggleShowSettings: () => set({ showSettings: !get().showSettings }),
        setIsExecuting: (executing) => set({ isExecuting: executing }),
        toggleIsExecuting: () => set({ isExecuting: !get().isExecuting }),

        // Run/Stop methods
        run: () => set({ isRunning: true }),
        stop: () => set({ isRunning: false }),

        // Perform ping and update status
        // const doPing = async () => {
        //   if (!wsQueue) return;

        //   setConnectionStatus("checking");
        //   const success = await wsQueue.ping();
        //   setConnectionStatus(success ? "connected" : "disconnected");

        //   if (!success) {
        //     console.error("Connection check failed - device may be offline");
        //   }
        // };

        reconnect: async () => {
          const success = await wsQueue?.updateUrl(`ws://${get().ip}/ws`);
          if (success) {
            get().doPing();
          } else {
            console.log("could not reconnect");
          }
        },

        doPing: async () => {
          set({ connectionStatus: "checking" });
          if (!wsQueue) {
            const ip = get().ip;
            wsQueue = new WSQueue(`ws://${ip}/ws`);
          }
          const success = await wsQueue.ping();
          set({ connectionStatus: success ? "connected" : "disconnected" });
        },
        queueSend: async (data) => {
          if (!wsQueue) {
            const ip = get().ip;
            wsQueue = new WSQueue(`ws://${ip}/ws`);
          }
          await wsQueue?.queueSend(data);
        },

        // File management methods
        createFile: (name, initialContent = null) => {
          const fileId = uuidv4();
          const newFile: File = {
            id: fileId,
            name,
            content: initialContent,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set({ files: [...get().files, newFile] });
          return fileId;
        },

        deleteFile: (fileId) => {
          const { files, tabs } = get();

          // Remove the file
          const newFiles = files.filter((file) => file.id !== fileId);

          // Close all tabs referencing this file
          const newTabs = tabs.filter((tab) => tab.fileId !== fileId);

          // Update active tab if necessary
          let newActiveTabId = get().activeTabId;
          const activeTab = tabs.find((t) => t.id === get().activeTabId);
          if (activeTab?.fileId === fileId) {
            newActiveTabId = newTabs.length > 0 ? newTabs[0].id : null;
          }

          set({
            files: newFiles,
            tabs: newTabs,
            activeTabId: newActiveTabId,
          });
        },

        updateFile: (fileId, content) => {
          const { files } = get();
          const fileIndex = files.findIndex((file) => file.id === fileId);

          if (fileIndex === -1) {
            console.warn(`File with id "${fileId}" does not exist`);
            return;
          }

          const newFiles = [...files];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            content,
            updatedAt: Date.now(),
          };
          set({ files: newFiles });
        },

        renameFile: (fileId, newName) => {
          const { files } = get();
          const fileIndex = files.findIndex((file) => file.id === fileId);

          if (fileIndex === -1) {
            console.warn(`File with id "${fileId}" does not exist`);
            return;
          }

          const newFiles = [...files];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            name: newName,
            updatedAt: Date.now(),
          };
          set({ files: newFiles });
        },

        getFile: (fileId) => {
          return get().files.find((file) => file.id === fileId);
        },

        // Tab management methods
        openTab: (fileId) => {
          const { tabs, files } = get();

          // Check if file exists
          const file = files.find((f) => f.id === fileId);
          if (!file) {
            console.warn(`File with id "${fileId}" does not exist`);
            return;
          }

          // Check if tab already exists for this file
          const existingTab = tabs.find((tab) => tab.fileId === fileId);
          if (existingTab) {
            // Just focus the existing tab
            set({ activeTabId: existingTab.id });
            return;
          }

          // Create new tab
          const newTab: Tab = {
            id: uuidv4(),
            fileId,
          };

          set({
            tabs: [...tabs, newTab],
            activeTabId: newTab.id,
          });
        },

        closeTab: (tabId) => {
          const { tabs, activeTabId } = get();
          const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

          if (tabIndex === -1) {
            console.warn(`Tab with id "${tabId}" does not exist`);
            return;
          }

          const newTabs = tabs.filter((tab) => tab.id !== tabId);

          // If closing the active tab, switch to another tab
          let newActiveTabId = activeTabId;
          if (activeTabId === tabId) {
            if (newTabs.length > 0) {
              // Switch to the previous tab, or first tab if closing the first one
              const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
              newActiveTabId = newTabs[newIndex]?.id || null;
            } else {
              newActiveTabId = null;
            }
          }

          set({ tabs: newTabs, activeTabId: newActiveTabId });
        },

        setActiveTab: (tabId) => {
          const { tabs } = get();
          const tab = tabs.find((tab) => tab.id === tabId);

          if (!tab) {
            console.warn(`Tab with id "${tabId}" does not exist`);
            return;
          }

          set({ activeTabId: tabId });
        },

        getActiveTab: () => {
          const { tabs, activeTabId } = get();
          return tabs.find((tab) => tab.id === activeTabId);
        },

        getActiveFile: () => {
          const activeTab = get().getActiveTab();
          if (!activeTab) return undefined;
          return get().getFile(activeTab.fileId);
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
        version: 4, // Increment version due to schema change
      }
    ),
    { name: "useAppStore" }
  )
);

export default useAppStore;
