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
import { useTranslation } from "react-i18next";


const BlocklyEditor = () => {
  const {t} = useTranslation()
  const blocklyDiv = useRef(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const shouldStopRef = useRef(false);

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
  const queueSend = useAppStore((state) => state.queueSend);
  const connectionStatus = useAppStore((state) => state.connectionStatus);
  const reconnect = useAppStore((state) => state.reconnect);
  const init = useAppStore((state) => state.init);
  const doPing = useAppStore((state) => state.doPing);

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
        // trashcan: true,
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

  useEffect(() => {
    init();
    setTimeout(() => {
      doPing()
    }, 1000)
  }, [init, doPing]);

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
          await queueSend({ cmd: "setPixelColor", index, r, g, b });
        },
        setAllPixelColor: async (r: number, g: number, b: number) => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log(`Set all pixel to RGB(${r},${g},${b})`);
          await queueSend({ cmd: "setColor", r, g, b });
        },
        clear: async () => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log("Cleared all pixels");
          await queueSend({ cmd: "clear" });
        },
        show: async () => {
          if (shouldStopRef.current) throw new Error("Stopped by user");
          console.log("Displayed pixels");
          await queueSend({ cmd: "show" });
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
    try {
      // Enable upload mode for synchronous code generation
      setUploadMode(true);

      const code = javascriptGenerator.workspaceToCode(workspace.current!);
      console.log("Upload code:", code);

      // Send the code to the device - the code is now synchronous
      // and can be executed directly on the device
      await queueSend({ cmd: "saveJS", code: code });

      console.log("Upload completed");
    } catch (error: any) {
      console.error("Upload error:", error);
    } finally {
      // Restore normal async mode
      setUploadMode(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "success";
      case "disconnected":
        return "error";
      case "checking":
        return "warning";
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
                disabled={connectionStatus !== "connected" || isRunning}
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
                disabled={connectionStatus !== "connected" }
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
            label={connectionStatus}
            color={getStatusColor(connectionStatus)}
            size="small"
          />
          {connectionStatus === "disconnected" && (
            <Button
              onClick={() => reconnect()}
              size="small"
            >
              {t('reconnect')}
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Tab Bar */}
      <Box display="flex" alignItems="center" borderBottom={1} borderColor="divider">
        <Tooltip title={t('open_file')}>
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
        <Tooltip title={t('new_file')}>
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
          <Button onClick={() => setShowFileDialog(false)}>{t('cancel')}</Button>
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