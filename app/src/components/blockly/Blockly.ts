import * as Blockly from "blockly";


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


export default Blockly;