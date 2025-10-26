const toolboxXmlString = `<xml xmlns="https://developers.google.com/blockly/xml">
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
        `;

export default toolboxXmlString;
