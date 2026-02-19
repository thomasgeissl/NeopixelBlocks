import { Box, Typography } from "@mui/material";
import TabPanel from "./TabPanel";

const Electronics = ({
  tabValue,
  index,
}: {
  tabValue: number;
  index: number;
}) => {
  return (
    <TabPanel value={tabValue} index={index}>
      <Typography variant="body1" gutterBottom>
        To make NeoPixels work safely and reliably, you need two important
        components: a resistor and a capacitor.
      </Typography>

      <Box sx={{ mt: 4, p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          330Ω Resistor on Data Line
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Why?</strong> The resistor protects the data signal. It
          prevents damage from voltage spikes and makes the signal cleaner.
        </Typography>
        <Typography variant="body2">
          Place a 330Ω (ohm) resistor between your controller's data pin and the
          first NeoPixel's data input (DIN).
        </Typography>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Capacitor on Power Line
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Why?</strong> The capacitor smooths out the power supply.
          NeoPixels use bursts of power when they change colors, and the
          capacitor helps provide stable electricity.
        </Typography>
        <Typography variant="body2">
          Use a 1000µF (microfarad) capacitor connected between the +5V and GND
          (ground) near your NeoPixels. Make sure the + leg connects to +5V and
          the - leg to GND!
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Safety Tips
      </Typography>
      <Box component="ul" sx={{ pl: 3 }}>
        <Typography component="li" variant="body2" paragraph>
          <strong>Always use these components:</strong> They protect your
          NeoPixels and controller
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          <strong>Capacitor polarity:</strong> The capacitor has a + and - side.
          Connect them correctly!
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          <strong>Power first:</strong> Connect power to the NeoPixels before
          sending data signals
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          <strong>Don't skip:</strong> Even for small projects, these components
          are important
        </Typography>
      </Box>
    </TabPanel>
  );
};

export default Electronics;
