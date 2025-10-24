import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator, Order } from "blockly/javascript";

import "blockly/blocks";
import { Box, IconButton, Chip, Button, Typography } from "@mui/material";
import { PlayArrow, Stop, Circle } from "@mui/icons-material";
import useAppStore from "../stores/app";
import WSQueue from "../WSQueue";

// Initialize without connection - will be set up in useEffect
let wsQueue: WSQueue | null = null;

// Define Blockly blocks
Blockly.Blocks["neopixel_program"] = {
  init: function () {
    this.appendDummyInput().appendField("Program");
    this.appendStatementInput("SETUP").setCheck(null).appendField("Setup");
    this.appendStatementInput("LOOP").setCheck(null).appendField("Loop");
    this.setColour(160);
    this.setTooltip("Main program block with setup and loop sections");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["neopixel_set_pixel"] = {
  init: function () {
    this.appendDummyInput().appendField("set pixel");
    this.appendValueInput("INDEX").setCheck("Number").appendField("index");
    this.appendValueInput("R").setCheck("Number").appendField("R");
    this.appendValueInput("G").setCheck("Number").appendField("G");
    this.appendValueInput("B").setCheck("Number").appendField("B");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Set pixel color at index with RGB values");
  },
};

Blockly.Blocks["neopixel_set_all_pixels"] = {
  init: function () {
    this.appendDummyInput().appendField("set all pixels");
    this.appendValueInput("R").setCheck("Number").appendField("R");
    this.appendValueInput("G").setCheck("Number").appendField("G");
    this.appendValueInput("B").setCheck("Number").appendField("B");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Set color at all pixels with RGB values");
  },
};

Blockly.Blocks["neopixel_show"] = {
  init: function () {
    this.appendDummyInput().appendField("show");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Display the LED changes");
  },
};

Blockly.Blocks["neopixel_clear"] = {
  init: function () {
    this.appendDummyInput().appendField("clear");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Clear all LEDs");
  },
};

Blockly.Blocks["neopixel_delay"] = {
  init: function () {
    this.appendValueInput("MS").setCheck("Number").appendField("delay");
    this.appendDummyInput().appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Delay for specified milliseconds");
  },
};

// Define code generators
(javascriptGenerator as any).forBlock["neopixel_program"] = function (
  block: Blockly.Block
) {
  const setupBlocks = block.getInputTargetBlock("SETUP");
  const loopBlocks = block.getInputTargetBlock("LOOP");

  const getNum = (block: Blockly.Block, name: string): number => {
    const code = javascriptGenerator.valueToCode(block, name, Order.ATOMIC);
    try {
      return code ? eval(code) : 0;
    } catch {
      return 0;
    }
  };

  const generateCmds = (block: Blockly.Block | null) => {
    const cmds: any[] = [];
    while (block) {
      switch (block.type) {
        case "neopixel_set_pixel":
          cmds.push({
            cmd: "setPixelColor",
            index: getNum(block, "INDEX"),
            r: getNum(block, "R"),
            g: getNum(block, "G"),
            b: getNum(block, "B"),
          });
          break;
        case "neopixel_set_all_pixels":
          cmds.push({
            cmd: "setColor",
            r: getNum(block, "R"),
            g: getNum(block, "G"),
            b: getNum(block, "B"),
          });
          break;
        case "neopixel_show":
          cmds.push({ cmd: "show" });
          break;
        case "neopixel_clear":
          cmds.push({ cmd: "clear" });
          break;
        case "neopixel_delay":
          cmds.push({ cmd: "delay", ms: getNum(block, "MS") });
          break;
        default:
          console.warn("Unhandled block type:", block.type);
      }
      block = block.getNextBlock();
    }
    return cmds;
  };

  const setupCmds = generateCmds(setupBlocks);
  const loopCmds = generateCmds(loopBlocks);

  console.log("SETUP:", setupCmds);
  console.log("LOOP:", loopCmds);

  return [JSON.stringify({ setup: setupCmds, loop: loopCmds }), Order.ATOMIC];
};

(javascriptGenerator as any).forBlock["neopixel_set_pixel"] = function (
  block: Blockly.Block
) {
  const index =
    javascriptGenerator.valueToCode(block, "INDEX", Order.ATOMIC) || "0";
  const r = javascriptGenerator.valueToCode(block, "R", Order.ATOMIC) || "0";
  const g = javascriptGenerator.valueToCode(block, "G", Order.ATOMIC) || "0";
  const b = javascriptGenerator.valueToCode(block, "B", Order.ATOMIC) || "0";
  return `await setPixelColor(${index}, ${r}, ${g}, ${b});\n`;
};

(javascriptGenerator as any).forBlock["neopixel_set_all_pixels"] = function (
  block: Blockly.Block
) {
  const r = javascriptGenerator.valueToCode(block, "R", Order.ATOMIC) || "0";
  const g = javascriptGenerator.valueToCode(block, "G", Order.ATOMIC) || "0";
  const b = javascriptGenerator.valueToCode(block, "B", Order.ATOMIC) || "0";
  return `await setColor(${r}, ${g}, ${b});\n`;
};

(javascriptGenerator as any).forBlock["neopixel_show"] = function () {
  return `await show();\n`;
};

(javascriptGenerator as any).forBlock["neopixel_clear"] = function () {
  return `await clear();\n`;
};

(javascriptGenerator as any).forBlock["neopixel_delay"] = function (
  block: Blockly.Block
) {
  const ms = javascriptGenerator.valueToCode(block, "MS", Order.ATOMIC) || "0";
  return `await delay(${ms});\n`;
};

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

  useEffect(() => {
    if (blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <category name="Logic" colour="210">
              <block type="controls_if"></block>
              <block type="logic_compare"></block>
              <block type="logic_operation"></block>
              <block type="logic_boolean"></block>
            </category>
            <category name="Loops" colour="120">
              <block type="controls_repeat_ext"></block>
              <block type="controls_whileUntil"></block>
              <block type="controls_for">
                <field name="VAR">i</field>
                <value name="FROM">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
                <value name="TO">
                  <shadow type="math_number">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
                <value name="BY">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
              </block>
            </category>
            <category name="Math" colour="230">
              <block type="math_number"></block>
              <block type="math_arithmetic"></block>
              <block type="math_round">
                <field name="OP">ROUND</field>
              </block>
              <block type="math_random_int" id="random1" x="20" y="20">
                <field name="FROM">0</field>
                <field name="TO">255</field>
              </block>
            </category>
            <category name="Neopixel" colour="290">
              <block type="neopixel_set_all_pixels">
                <value name="R">
                  <shadow type="math_number">
                    <field name="NUM">255</field>
                  </shadow>
                </value>
                <value name="G">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
                <value name="B">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
              </block>
              <block type="neopixel_set_pixel">
                <value name="INDEX">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
                <value name="R">
                  <shadow type="math_number">
                    <field name="NUM">255</field>
                  </shadow>
                </value>
                <value name="G">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
                <value name="B">
                  <shadow type="math_number">
                    <field name="NUM">0</field>
                  </shadow>
                </value>
              </block>
              <block type="neopixel_show"></block>
              <block type="neopixel_clear"></block>
              <block type="neopixel_delay">
                <value name="MS">
                  <shadow type="math_number">
                    <field name="NUM">1000</field>
                  </shadow>
                </value>
              </block>
            </category>
            <category name="Variables" colour="330" custom="VARIABLE"></category>
          </xml>
        `,
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
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
        <Typography variant="h1" flex={1} padding={1} fontSize={16} color="primary.main">
          Neopixel Blocks
        </Typography>
        <IconButton onClick={handleRun} color="primary" disabled={isRunning}>
          <PlayArrow />
        </IconButton>
        <IconButton onClick={handleStop} color="error" disabled={!isRunning}>
          <Stop />
        </IconButton>
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
