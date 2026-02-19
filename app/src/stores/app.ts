import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import WSQueue from "../WSQueue";
import type { FileExport } from "./fileExport";

import chase from "./examples/chase.json";

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

// Simulator layout and LED state
export type SimulatorLayout = "line" | "matrix" | "ring";

export interface SimulatorLayoutConfig {
  id: string;
  name: string;
  type: SimulatorLayout;
  pixelCount: number;
}

// Store shape with both state and actions
export type AppState = {
  ip: string | null;
  showSettings: boolean;
  showPreview: boolean;
  showSchool: boolean;
  isExecuting: boolean;
  isRunning: boolean;
  files: File[];
  examples: File[];
  tabs: Tab[];
  activeTabId: string | null;
  connectionStatus: "connected" | "disconnected" | "checking" | "unknown";
  pingIntervalId?: number | null;

  // Simulator: list of layout configs, active one, displayed LEDs and pending buffer (only shown after show())
  simulatorLayouts: SimulatorLayoutConfig[];
  activeSimulatorLayoutId: string | null;
  simulatorLeds: Array<{ r: number; g: number; b: number }>;
  simulatorLedsPending: Array<{ r: number; g: number; b: number }>;

  init: () => void;
  setIp: (ip: string | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  getActiveSimulatorLayout: () => SimulatorLayoutConfig | undefined;
  addSimulatorLayout: (config: Omit<SimulatorLayoutConfig, "id">) => string;
  updateSimulatorLayout: (id: string, config: Partial<Omit<SimulatorLayoutConfig, "id">>) => void;
  removeSimulatorLayout: (id: string) => void;
  setActiveSimulatorLayout: (id: string | null) => void;
  setSimulatorPixelColor: (index: number, r: number, g: number, b: number) => void;
  setSimulatorColor: (r: number, g: number, b: number) => void;
  simulatorShow: () => void;
  clearSimulator: () => void;
  resetSimulator: () => void;
  requestSimulatorRun: () => void;
  requestSimulatorStop: () => void;
  clearSimulatorRunRequest: () => void;
  clearSimulatorStopRequest: () => void;
  toggleShowSettings: () => void;
  toggleShowSchool: () => void;
  setIsExecuting: (executing: boolean) => void;
  toggleIsExecuting: () => void;

  // Run/Stop control
  run: () => void;
  stop: () => void;
  simulatorRunRequested: number;
  simulatorStopRequested: number;
  reconnect: () => void;

  doPing: () => void;
  queueSend: (data: any) => void;

  // File management
  createFile: (name: string, initialContent?: any) => string; // Returns file ID
  deleteFile: (fileId: string) => void;
  updateFile: (fileId: string, content: any) => void;
  renameFile: (fileId: string, newName: string) => void;
  getFile: (fileId: string) => File | undefined;
  exportFile: (fileId: string) => FileExport | null;

  loadExample: (exampleId: string) => string; // returns new file ID
  getExample: (exampleId: string) => File | undefined;

  // Tab management
  openTab: (fileId: string) => void; // Opens file in new tab or focuses existing
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  getActiveTab: () => Tab | undefined;
  getActiveFile: () => File | undefined;
  reorderTabs: (startIndex: number, endIndex: number) => void;
  exportActiveFile: () => FileExport | null;
  importFile: (data: FileExport, options?: { open?: boolean }) => string;
};

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ip: "",
        showSettings: false,
        showPreview: false,
        showSchool: false,
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
        examples: [
          {
            ...chase,
            id: uuidv4(),
          },
        ],
        tabs: [],
        activeTabId: null,
        connectionStatus: "unknown",
        simulatorRunRequested: 0,
        simulatorStopRequested: 0,

        simulatorLayouts: [
          { id: "default-matrix", name: "8×8 Matrix", type: "matrix", pixelCount: 64 },
          { id: "default-matrix-5x5", name: "5×5 Matrix", type: "matrix", pixelCount: 25 },
          { id: "default-strip", name: "Strip 30", type: "line", pixelCount: 30 },
          { id: "default-ring", name: "Ring 24", type: "ring", pixelCount: 24 },
        ],
        activeSimulatorLayoutId: "default-matrix",
        simulatorLeds: Array(64)
          .fill(null)
          .map(() => ({ r: 0, g: 0, b: 0 })),
        simulatorLedsPending: Array(64)
          .fill(null)
          .map(() => ({ r: 0, g: 0, b: 0 })),

        init: () => {
          const ip = get().ip;
          if (ip) {
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
          set({ ip });
          get().reconnect();
        },
        setShowSettings: (show) => set({ showSettings: show }),
        setShowPreview: (show) => set({ showPreview: show }),
        getActiveSimulatorLayout: () => {
          const { simulatorLayouts, activeSimulatorLayoutId } = get();
          if (!simulatorLayouts?.length) return undefined;
          if (activeSimulatorLayoutId) {
            const found = simulatorLayouts.find((l) => l.id === activeSimulatorLayoutId);
            if (found) return found;
          }
          return simulatorLayouts[0];
        },
        addSimulatorLayout: (config) => {
          const id = uuidv4();
          const layout: SimulatorLayoutConfig = { ...config, id };
          const pixelCount = Math.max(1, Math.min(512, config.pixelCount));
          layout.pixelCount = pixelCount;
          set({ simulatorLayouts: [...(get().simulatorLayouts || []), layout] });
          get().resetSimulator();
          return id;
        },
        updateSimulatorLayout: (id, updates) => {
          const { simulatorLayouts } = get();
          const idx = simulatorLayouts.findIndex((l) => l.id === id);
          if (idx === -1) return;
          const next = [...simulatorLayouts];
          next[idx] = { ...next[idx], ...updates };
          if (typeof updates.pixelCount === "number") {
            next[idx].pixelCount = Math.max(1, Math.min(512, updates.pixelCount));
          }
          set({ simulatorLayouts: next });
          get().resetSimulator();
        },
        removeSimulatorLayout: (id) => {
          const { simulatorLayouts, activeSimulatorLayoutId } = get();
          const next = simulatorLayouts.filter((l) => l.id !== id);
          let newActive = activeSimulatorLayoutId;
          if (activeSimulatorLayoutId === id) {
            newActive = next.length ? next[0].id : null;
          }
          set({ simulatorLayouts: next, activeSimulatorLayoutId: newActive });
          get().resetSimulator();
        },
        setActiveSimulatorLayout: (id) => {
          set({ activeSimulatorLayoutId: id });
          get().resetSimulator();
        },
        setSimulatorPixelColor: (index, r, g, b) => {
          const { simulatorLedsPending } = get();
          const layout = get().getActiveSimulatorLayout();
          const pixelCount = layout?.pixelCount ?? 64;
          if (index < 0 || index >= pixelCount) return;
          const next = [...simulatorLedsPending];
          if (!next[index]) next[index] = { r: 0, g: 0, b: 0 };
          next[index] = { r, g, b };
          set({ simulatorLedsPending: next });
        },
        setSimulatorColor: (r, g, b) => {
          const layout = get().getActiveSimulatorLayout();
          const pixelCount = layout?.pixelCount ?? 64;
          set({
            simulatorLedsPending: Array(pixelCount)
              .fill(null)
              .map(() => ({ r, g, b })),
          });
        },
        simulatorShow: () => {
          const { simulatorLedsPending } = get();
          set({ simulatorLeds: [...simulatorLedsPending] });
        },
        clearSimulator: () => {
          const layout = get().getActiveSimulatorLayout();
          const pixelCount = layout?.pixelCount ?? 64;
          set({
            simulatorLedsPending: Array(pixelCount)
              .fill(null)
              .map(() => ({ r: 0, g: 0, b: 0 })),
          });
        },
        resetSimulator: () => {
          const layout = get().getActiveSimulatorLayout();
          const pixelCount = layout?.pixelCount ?? 64;
          const blank = () =>
            Array(pixelCount)
              .fill(null)
              .map(() => ({ r: 0, g: 0, b: 0 }));
          set({
            simulatorLeds: blank(),
            simulatorLedsPending: blank(),
          });
        },
        requestSimulatorRun: () => set((s) => ({ simulatorRunRequested: s.simulatorRunRequested + 1 })),
        requestSimulatorStop: () => set((s) => ({ simulatorStopRequested: s.simulatorStopRequested + 1 })),
        clearSimulatorRunRequest: () => set({ simulatorRunRequested: 0 }),
        clearSimulatorStopRequest: () => set({ simulatorStopRequested: 0 }),
        toggleShowSettings: () => set({ showSettings: !get().showSettings }),
        toggleShowSchool: () => set({ showSchool: !get().showSchool }),
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
        exportFile: (tabId: string) => {
          const { tabs, files } = get();
          const tab = tabs.find((t) => t.id === tabId);
          if (!tab) return null;

          const file = files.find((f) => f.id === tab.fileId);
          return file ?? null;
        },
        loadExample: (exampleId: string) => {
          const example = get().examples.find((e) => e.id === exampleId);
          if (!example) return "";

          const clonedContent = structuredClone(example.content);

          // Create the file with content already set
          const newFileId = get().createFile(example.name, clonedContent);

          // Open the new tab
          get().openTab(newFileId);

          return newFileId;
        },

        getExample: (exampleId: string) => {
          return get().examples.find((e) => e.id === exampleId);
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
        exportActiveFile: () => {
          const file = get().getActiveFile();
          if (!file) return null;

          return {
            name: file.name,
            content: file.content,
          };
        },
        importFile: (data, options = { open: true }) => {
          const fileId = uuidv4();
          const now = Date.now();

          const newFile: File = {
            id: fileId,
            name: data.name,
            content: structuredClone(data.content),
            createdAt: now,
            updatedAt: now,
          };

          set({ files: [...get().files, newFile] });

          if (options.open) {
            get().openTab(fileId);
          }

          return fileId;
        },
      }),
      {
        name: "app-storage",
        version: 8,
        migrate: (persistedState: any, version: number) => {
          const s = persistedState as any;
          // v7 -> v8: simulator only updates display on show() - add pending buffer
          if (version < 8) {
            const leds = s.simulatorLeds;
            const len = Array.isArray(leds) ? leds.length : 64;
            s.simulatorLedsPending =
              Array.isArray(leds) && len > 0
                ? leds.map((p: { r: number; g: number; b: number }) => ({ ...p }))
                : Array(len)
                    .fill(null)
                    .map(() => ({ r: 0, g: 0, b: 0 }));
          }
          // v4 -> v5: create simulatorLayouts from old simulatorLayout/simulatorPixelCount
          if (version < 5 && s.simulatorLayouts == null) {
            const layout = s.simulatorLayout ?? "matrix";
            const pixelCount = Math.max(1, Math.min(512, s.simulatorPixelCount ?? 64));
            const id = "migrated-" + (s.simulatorLayout ?? "matrix");
            s.simulatorLayouts = [
              { id, name: `${layout} ${pixelCount}`, type: layout, pixelCount },
              { id: "default-matrix", name: "8×8 Matrix", type: "matrix", pixelCount: 64 },
              { id: "default-strip", name: "Strip 30", type: "line", pixelCount: 30 },
              { id: "default-ring", name: "Ring 24", type: "ring", pixelCount: 24 },
            ].filter((l: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === l.id) === i);
            s.activeSimulatorLayoutId = id;
            delete s.simulatorLayout;
            delete s.simulatorPixelCount;
          }
          // v5 -> v6: add 5×5 Matrix if missing
          if (version < 6 && Array.isArray(s.simulatorLayouts)) {
            const has5x5 = s.simulatorLayouts.some((l: any) => l.id === "default-matrix-5x5");
            if (!has5x5) {
              s.simulatorLayouts = [
                ...s.simulatorLayouts,
                { id: "default-matrix-5x5", name: "5×5 Matrix", type: "matrix", pixelCount: 25 },
              ];
            }
          }
          // v6 -> v7: add simulator run/stop request counters
          if (version < 7) {
            if (s.simulatorRunRequested === undefined) s.simulatorRunRequested = 0;
            if (s.simulatorStopRequested === undefined) s.simulatorStopRequested = 0;
          }
          return s;
        },
      },
    ),
    { name: "useAppStore" },
  ),
);

export default useAppStore;
