import Blockly from "./Blockly";
import { javascriptGenerator, Order } from "blockly/javascript";

// Track generation mode
let isUploadMode = false;

export function setUploadMode(enabled: boolean) {
  isUploadMode = enabled;
}

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
  
  if (isUploadMode) {
    return `setPixelColor(${index}, ${r}, ${g}, ${b});\n`;
  }
  return `await setPixelColor(${index}, ${r}, ${g}, ${b});\n`;
};

(javascriptGenerator as any).forBlock["neopixel_set_all_pixels"] = function (
  block: Blockly.Block
) {
  const r = javascriptGenerator.valueToCode(block, "R", Order.ATOMIC) || "0";
  const g = javascriptGenerator.valueToCode(block, "G", Order.ATOMIC) || "0";
  const b = javascriptGenerator.valueToCode(block, "B", Order.ATOMIC) || "0";
  
  if (isUploadMode) {
    return `setColor(${r}, ${g}, ${b});\n`;
  }
  return `await setColor(${r}, ${g}, ${b});\n`;
};

(javascriptGenerator as any).forBlock["neopixel_show"] = function () {
  if (isUploadMode) {
    return `show();\n`;
  }
  return `await show();\n`;
};

(javascriptGenerator as any).forBlock["neopixel_clear"] = function () {
  if (isUploadMode) {
    return `clear();\n`;
  }
  return `await clear();\n`;
};

(javascriptGenerator as any).forBlock["neopixel_delay"] = function (
  block: Blockly.Block
) {
  const ms = javascriptGenerator.valueToCode(block, "MS", Order.ATOMIC) || "0";
  
  if (isUploadMode) {
    return `delay(${ms});\n`;
  }
  return `await delay(${ms});\n`;
};