

import * as React from "react";
import useAppStore from "../stores/app";
import { Dialog, DialogContent, DialogTitle, Tabs, Tab, Box, Slider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const School: React.FC = () => {
  const ip = useAppStore((state) => state.ip);
  const setIp = useAppStore((state) => state.setIp);
  const { t } = useTranslation();
  
  const [tabValue, setTabValue] = React.useState(0);
  const [r, setR] = React.useState(255);
  const [g, setG] = React.useState(128);
  const [b, setB] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const rgbColor = `rgb(${r}, ${g}, ${b})`;
  const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return (
    <Dialog
      open={true}
      onClose={() => useAppStore.getState().toggleShowSchool()}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('Information')}</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rgb and neopixel tabs">
            <Tab label="RGB Colors" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="NeoPixel Addressing" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" gutterBottom>
            RGB stands for Red, Green, and Blue. By mixing different intensities of these three primary colors, 
            we can create millions of different colors. Each color channel uses 8-bit values (0-255).
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Red: {r}
            </Typography>
            <Slider
              value={r}
              onChange={(e, val) => setR(val as number)}
              min={0}
              max={255}
              sx={{ color: 'error.main' }}
            />

            <Typography variant="h6" color="success.main" gutterBottom sx={{ mt: 3 }}>
              Green: {g}
            </Typography>
            <Slider
              value={g}
              onChange={(e, val) => setG(val as number)}
              min={0}
              max={255}
              sx={{ color: 'success.main' }}
            />

            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
              Blue: {b}
            </Typography>
            <Slider
              value={b}
              onChange={(e, val) => setB(val as number)}
              min={0}
              max={255}
              sx={{ color: 'primary.main' }}
            />

            <Box sx={{ mt: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  backgroundColor: rgbColor,
                  border: '2px solid #ccc',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>RGB:</strong> {rgbColor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Hex:</strong> {hexColor.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            What are NeoPixels?
          </Typography>
          <Typography variant="body1" paragraph>
            NeoPixels are individually addressable RGB LEDs that can be controlled with a single data line. 
            Each LED contains a tiny controller chip that receives color data and passes the remaining data 
            to the next LED in the chain.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            How Addressing Works
          </Typography>
          <Typography variant="body1" paragraph>
            NeoPixels are addressed sequentially, starting from index 0. When you send data to a NeoPixel strip:
          </Typography>
          <Box component="ol" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              The first LED (index 0) reads the first 24 bits of data (8 bits each for R, G, B)
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              It stores this color data and passes the remaining data to the next LED
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Each subsequent LED does the same, taking its 24 bits and passing the rest forward
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              This continues until all LEDs have received their color data
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Example Chain
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'error.main',
                    borderRadius: '50%',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  0
                </Box>
                <Typography variant="caption">First LED</Typography>
              </Box>
              <Typography variant="h5">→</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  1
                </Box>
                <Typography variant="caption">Second LED</Typography>
              </Box>
              <Typography variant="h5">→</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    border: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  2
                </Box>
                <Typography variant="caption">Third LED</Typography>
              </Box>
              <Typography variant="h5">→ ...</Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Data flows in one direction, with each LED taking its color and forwarding the rest.
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Key Points
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              <strong>Zero-indexed:</strong> The first LED is at index 0, not 1
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Serial data:</strong> All LEDs share one data line
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Timing critical:</strong> Data must be sent at precise intervals
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>No feedback:</strong> LEDs don't send data back to the controller
            </Typography>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default School;