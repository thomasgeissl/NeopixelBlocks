import { useEffect, useRef, useState } from "react";
import Blockly from "./blockly/Blockly";
import "./blockly/generator";
import { setUploadMode } from "./blockly/generator";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/blocks";
import toolboxXmlString from "./blockly/toolbox";

import {
  Box,
  Chip,
  Button,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Circle,
  UploadFile,
  SlowMotionVideo,
} from "@mui/icons-material";
import useAppStore from "../stores/app";
import WSQueue from "../WSQueue";

// Initialize without connection - will be set up in useEffect
let wsQueue: WSQueue | null = null;

const BlocklyEditor = () => {
  const blocklyDiv = useRef(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const shouldStopRef = useRef(false);
  const pingIntervalRef = useRef<number | null>(null);

  // Subscribe to IP changes from store
  const ip = useAppStore((state) => state.ip);
  const [selectedTab, setSelectedTab] = useState(0);

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
    await wsQueue.queueSend({ cmd: "upload", code: code });

    console.log("Upload completed");
  } catch (error: any) {
    console.error("Upload error:", error);
  } finally {
    // Restore normal async mode
    setUploadMode(false);
  }
};

  const handlePreview = () => {
    useAppStore.getState().setShowPreview(true);
  };

  useEffect(() => {
    if (blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxXmlString,
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
        // zoom: {
        //   controls: true,
        //   wheel: true,
        //   startScale: 1.0,
        //   maxScale: 3,
        //   minScale: 0.3,
        //   scaleSpeed: 1.2,
        // },
        trashcan: true,
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, []);

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
    <Box display="flex" flexDirection="column" height="100%">
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
                Run
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
                Stop
              </Button>
            </Tooltip>
          )}
          {!isRunning && (
            <Tooltip title="Preview code">
              <Button
                color="primary"
                onClick={handlePreview}
                startIcon={<SlowMotionVideo />}
                variant="outlined"
              >
                Run Preview
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
                Upload
              </Button>
            </Tooltip>
          )}
        </Box>
        {/* <Typography
          variant="h1"
          flex={1}
          padding={1}
          fontSize={16}
          color="primary.main"
          textAlign={"center"}
        >
          Neopixel Blocks
        </Typography> */}
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          sx={{ marginLeft: 2 }}
        >
          <Tab label="tab 1" />
          <Tab label="tab 2" />
        </Tabs>
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
              onClick={() => {
                wsQueue?.updateUrl(`ws://${ip}/ws`);
                doPing();
              }}
              size="small"
            >
              Reconnect
            </Button>
          )}
        </Box>
      </Box>
      <Box
        ref={blocklyDiv}
        className="flex-1 w-full"
        style={{ height: "800px" }}
      />
    </Box>
  );
};

export default BlocklyEditor;
