import { useEffect, useRef, useState } from "react";
import Blockly from "./blockly/Blockly";
import "./blockly/generator";
import { setUploadMode } from "./blockly/generator";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/blocks";
import toolboxXmlString from "./blockly/toolbox";

import { Box, Chip, Button, Tooltip, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemButton, DialogActions } from "@mui/material";
import {
  PlayArrow,
  Stop,
  Circle,
  UploadFile,
  Close,
  Add,
  FolderOpen,
  Delete,
} from "@mui/icons-material";
import useAppStore from "../stores/app";
import WSQueue from "../WSQueue";
import { useTranslation } from "react-i18next";

// Initialize without connection - will be set up in useEffect
let wsQueue: WSQueue | null = null;

const BlocklyEditor = () => {
  const {t} = useTranslation()
  const blocklyDiv = useRef(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [showFileDialog, setShowFileDialog] = useState(false);
  const shouldStopRef = useRef(false);
  const pingIntervalRef = useRef<number | null>(null);

  // Subscribe to store
  const ip = useAppStore((state) => state.ip);
  const files = useAppStore((state) => state.files);
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const getActiveFile = useAppStore((state) => state.getActiveFile);
  const updateFile = useAppStore((state) => state.updateFile);
  const openTab = useAppStore((state) => state.openTab);
  const closeTab = useAppStore((state) => state.closeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const createFile = useAppStore((state) => state.createFile);
  const getFile = useAppStore((state) => state.getFile);
  const deleteFile = useAppStore((state) => state.deleteFile);

  // Perform ping and update status
  const doPing = async () => {
    if (!wsQueue) return;

    setConnectionStatus("checking");
    const success = await wsQueue.ping();
    setConnectionStatus(success ? "connected" : "disconnected");

    if (!success) {
      console.error("Connection check failed - device may be offline");
    }
  };

  // Initialize connection on mount and when IP changes
  useEffect(() => {
    const wsUrl = `ws://${ip}/ws`;
    console.log(`Connecting to ${wsUrl}`);

    // Create new connection
    if (wsQueue) {
      wsQueue.updateUrl(wsUrl);
    } else {
      wsQueue = new WSQueue(wsUrl);
    }

    // Wait a bit for connection to establish, then ping
    const initialPingTimeout = setTimeout(() => {
      doPing();
    }, 500);

    return () => {
      clearTimeout(initialPingTimeout);
    };
  }, [ip]);

  // Set up periodic ping
  useEffect(() => {
    // Set up interval (60000ms = 1 minute)
    pingIntervalRef.current = window.setInterval(doPing, 60000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  // Initialize Blockly workspace
  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxXmlString,
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
        trashcan: true,
      });

      // Add change listener to auto-save
      workspace.current.addChangeListener(() => {
        const activeFile = getActiveFile();
        if (activeFile && workspace.current) {
          const state = Blockly.serialization.workspaces.save(workspace.current);
          updateFile(activeFile.id, state);
        }
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, []);

  // Open first file on mount if no tabs are open
  useEffect(() => {
    if (tabs.length === 0 && files.length > 0) {
      openTab(files[0].id);
    }
  }, [tabs.length, files.length, openTab]);

  // Load active file content into workspace
  useEffect(() => {
    const activeFile = getActiveFile();
    
    if (!workspace.current || !activeFile) return;

    try {
      // Clear workspace first
      workspace.current.clear();
      
      // Load content if it exists
      if (activeFile.content) {
        Blockly.serialization.workspaces.load(activeFile.content, workspace.current);
      }
    } catch (error) {
      console.error("Error loading workspace:", error);
    }
  }, [activeTabId]);

  const handleStop = () => {
    shouldStopRef.current = true;
    console.log("Stop requested");
  };

  const handleRun = async () => {
    if (!wsQueue) {
      console.error("WebSocket not initialized");
      return;
    }

    try {
      shouldStopRef.current = false;
      setIsRunning(true);

      const code = javascriptGenerator.workspaceToCode(workspace.current!);
      console.log(code);

      // Non-blocking delay that checks for stop
      const delay = (ms: number) => {
        return new Promise<void>((resolve, reject) => {
          const checkInterval = 50;
          let elapsed = 0;

          const interval = setInterval(() => {
            if (shouldStopRef.current) {
              clearInterval(interval);
              reject(new Error("Stopped by user"));
              return;
            }

            elapsed += checkInterval;
            if (elapsed >= ms) {
              clearInterval(interval);
              resolve();
            }
          }, checkInterval);
        });
      };

      const mockFunctions = {
        setPixelColor: async (
          index: number,
          r: number,
          g: number,
          b: number
        ) => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log(`Set pixel ${index} to RGB(${r},${g},${b})`);
          await wsQueue!.queueSend({ cmd: "setPixelColor", index, r, g, b });
        },
        setAllPixelColor: async (r: number, g: number, b: number) => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log(`Set all pixel to RGB(${r},${g},${b})`);
          await wsQueue!.queueSend({ cmd: "setColor", r, g, b });
        },
        clear: async () => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log("Cleared all pixels");
          await wsQueue!.queueSend({ cmd: "clear" });
        },
        show: async () => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log("Displayed pixels");
          await wsQueue!.queueSend({ cmd: "show" });
        },
        delay: delay,
      };

      console.log("Generated code:", code);

      const asyncCode = `(async function() {\n${code}\n})()`;

      await new Function(
        "setPixelColor",
        "setColor",
        "clear",
        "show",
        "delay",
        `return ${asyncCode}`
      )(
        mockFunctions.setPixelColor,
        mockFunctions.setAllPixelColor,
        mockFunctions.clear,
        mockFunctions.show,
        mockFunctions.delay
      );

      console.log("Execution completed");
    } catch (error: any) {
      if (error.message === "Stopped by user") {
        console.log("Execution stopped by user");
      } else {
        console.error("Execution error:", error);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleUpload = async () => {
    if (!wsQueue) {
      console.error("WebSocket not initialized");
      return;
    }

    try {
      // Enable upload mode for synchronous code generation
      setUploadMode(true);

      const code = javascriptGenerator.workspaceToCode(workspace.current!);
      console.log("Upload code:", code);

      // Send the code to the device - the code is now synchronous
      // and can be executed directly on the device
      await wsQueue.queueSend({ cmd: "saveJS", code: code });

      console.log("Upload completed");
    } catch (error: any) {
      console.error("Upload error:", error);
    } finally {
      // Restore normal async mode
      setUploadMode(false);
    }
  };

  // const handlePreview = () => {
  //   useAppStore.getState().setShowPreview(true);
  // };

  const handleNewFile = () => {
    const fileId = createFile(`Untitled ${files.length + 1}`);
    openTab(fileId);
  };

  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeTab(tabId);
  };

  const handleOpenFile = (fileId: string) => {
    openTab(fileId);
    setShowFileDialog(false);
  };

  const handleDeleteFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this file?")) {
      deleteFile(fileId);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "success";
      case "disconnected":
        return "error";
      case "checking":
        return "warning";
    }
  };

  const getStatusLabel = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "checking":
        return "Checking...";
    }
  };

  return (
    <Box flex={1} display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          {!isRunning && (
            <Tooltip title="Run code">
              <Button
                onClick={handleRun}
                color="primary"
                disabled={isRunning}
                startIcon={<PlayArrow />}
                variant="outlined"
              >
                {t('run')}
              </Button>
            </Tooltip>
          )}
          {isRunning && (
            <Tooltip title="Stop code">
              <Button
                onClick={handleStop}
                color="error"
                disabled={!isRunning}
                startIcon={<Stop />}
                variant="outlined"
              >
                {t('stop')}
              </Button>
            </Tooltip>
          )}
          {!isRunning && (
            <Tooltip title="Upload code to device">
              <Button
                onClick={handleUpload}
                color="primary"
                startIcon={<UploadFile />}
                variant="outlined"
              >
                {t('upload')}
              </Button>
            </Tooltip>
          )}
        </Box>
        <Box flex={1} />
        <Box display={"flex"} alignItems="center" gap={2}>
          {ip != "" && (
            <span onClick={() => useAppStore.getState().setShowSettings(true)}>
              {ip}
            </span>
          )}
          {ip === "" && (
            <span onClick={() => useAppStore.getState().setShowSettings(true)}>
              click to set ip
            </span>
          )}
          <Chip
            icon={<Circle sx={{ fontSize: 12 }} />}
            label={getStatusLabel()}
            color={getStatusColor()}
            size="small"
          />
          {getStatusLabel() === "Disconnected" && (
            <Button
              onClick={async () => {
                const success = await wsQueue?.updateUrl(`ws://${ip}/ws`);
                if (success) {
                  doPing();
                } else {
                  console.log("could not reconnect");
                }
              }}
              size="small"
            >
              Reconnect
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Tab Bar */}
      <Box display="flex" alignItems="center" borderBottom={1} borderColor="divider">
        <Tooltip title="Open file">
          <IconButton onClick={() => setShowFileDialog(true)} size="small" sx={{ mr: 1 }}>
            <FolderOpen />
          </IconButton>
        </Tooltip>
        <Tabs
          value={activeTabId || false}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => {
            const file = getFile(tab.fileId);
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{file?.name || "Untitled"}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      sx={{ padding: 0.5 }}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                }
              />
            );
          })}
        </Tabs>
        <Tooltip title="New file">
          <IconButton onClick={handleNewFile} size="small" sx={{ ml: 1 }}>
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      {/* File Browser Dialog */}
      <Dialog 
        open={showFileDialog} 
        onClose={() => setShowFileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Open File</DialogTitle>
        <DialogContent>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleOpenFile(file.id)}>
                  <ListItemText 
                    primary={file.name}
                    secondary={new Date(file.updatedAt).toLocaleString()}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Box
        ref={blocklyDiv}
        flex={1}
        style={{ minHeight: 0 }}
      />
    </Box>
  );
};

export default BlocklyEditor;