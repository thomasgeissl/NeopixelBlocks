import TabPanel from "./TabPanel";
import { Typography, Box } from "@mui/material";

const SystemArchitecture = ({ tabValue, index }: { tabValue: number; index: number }) => {
  return (
    <TabPanel value={tabValue} index={index}>
      <Typography variant="h6" gutterBottom>
        System Architecture
      </Typography>

      <Typography variant="body1" paragraph>
        The system is composed of two primary components: a user interface
        running in the browser and a microcontroller responsible for driving the
        NeoPixel LEDs. These components operate as independent processes but
        form a single logical system through network-based communication.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Firmware Layer
      </Typography>

      <Typography variant="body1" paragraph>
        The microcontroller must be flashed with a dedicated firmware named
        <strong> NeoPixelCommander</strong>. This firmware exposes a WebSocket
        server and translates incoming messages into precise timing signals
        required by NeoPixel LEDs. Without this firmware, direct control from
        the application is not possible.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Network Requirements
      </Typography>

      <Typography variant="body1" paragraph>
        Both the browser-based application and the microcontroller must reside
        on the same local network. This constraint simplifies discovery and
        avoids the need for external routing or cloud services. Communication is
        performed directly over the local area network.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Communication Model
      </Typography>

      <Typography variant="body1" paragraph>
        The application communicates with the microcontroller using the
        WebSocket protocol. WebSockets provide a persistent, low-latency,
        bidirectional channel that is well suited for real-time LED updates such
        as color changes, animations, and layout reconfiguration.
      </Typography>

      <Typography variant="body2" paragraph>
        From an architectural perspective, the browser acts as a client issuing
        high-level commands, while the microcontroller functions as a stateful
        real-time executor. The separation ensures that timing-sensitive LED
        control remains on the device closest to the hardware.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Summary
      </Typography>

      <Box component="ul" sx={{ pl: 3 }}>
        <Typography component="li" variant="body2" paragraph>
          The microcontroller runs the NeoPixelCommander firmware
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          Both devices must be connected to the same network
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          Communication is handled via WebSockets
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          Real-time constraints are handled entirely on the microcontroller
        </Typography>
      </Box>
    </TabPanel>
  );
};

export default SystemArchitecture;
