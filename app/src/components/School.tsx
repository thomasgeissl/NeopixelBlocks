import * as React from "react";
import useAppStore from "../stores/app";
import { Dialog, DialogContent, DialogTitle, Tabs, Tab, Box, Slider, Typography, Button } from "@mui/material";
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
  const { t } = useTranslation();
  
  const [tabValue, setTabValue] = React.useState(0);
  const [r, setR] = React.useState(255);
  const [g, setG] = React.useState(128);
  const [b, setB] = React.useState(0);
  const [layout, setLayout] = React.useState<'line' | 'circle' | 'matrix'>('line');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
      <DialogTitle>{t('settings')}</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rgb and neopixel tabs">
            <Tab label="RGB Colors" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="NeoPixel Addressing" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Electronics" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" gutterBottom>
            Mix red, green, and blue light to make any color! Each color can be from 0 (off) to 255 (brightest).
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>Try these colors:</Typography>
            <Button variant="outlined" size="small" onClick={() => { setR(255); setG(165); setB(0); }}>
              Orange
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(128); setG(0); setB(128); }}>
              Purple
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(255); setG(255); setB(0); }}>
              Yellow
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(0); setG(255); setB(255); }}>
              Cyan
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(255); setG(192); setB(203); }}>
              Pink
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(255); setG(255); setB(255); }}>
              White
            </Button>
            <Button variant="outlined" size="small" onClick={() => { setR(0); setG(0); setB(0); }}>
              Black
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Red: {r}
            </Typography>
            <Slider
              value={r}
              onChange={(_, val) => setR(val as number)}
              min={0}
              max={255}
              sx={{ color: 'error.main' }}
            />

            <Typography variant="h6" color="success.main" gutterBottom sx={{ mt: 3 }}>
              Green: {g}
            </Typography>
            <Slider
              value={g}
              onChange={(_, val) => setG(val as number)}
              min={0}
              max={255}
              sx={{ color: 'success.main' }}
            />

            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
              Blue: {b}
            </Typography>
            <Slider
              value={b}
              onChange={(_, val) => setB(val as number)}
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
          <Typography variant="body1" gutterBottom>
            NeoPixels are smart LEDs that you can control one by one. Each LED has a number starting from 0.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>Choose a layout:</Typography>
            <Button 
              variant={layout === 'line' ? 'contained' : 'outlined'} 
              size="small" 
              onClick={() => setLayout('line')}
            >
              Line (Strip)
            </Button>
            <Button 
              variant={layout === 'circle' ? 'contained' : 'outlined'} 
              size="small" 
              onClick={() => setLayout('circle')}
            >
              Circle (Ring)
            </Button>
            <Button 
              variant={layout === 'matrix' ? 'contained' : 'outlined'} 
              size="small" 
              onClick={() => setLayout('matrix')}
            >
              Matrix (Grid)
            </Button>
          </Box>

          {layout === 'line' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Line Layout (LED Strip)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', my: 2 }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <React.Fragment key={i}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: i === 0 ? 'error.main' : i === 1 ? 'success.main' : i === 2 ? 'primary.main' : 'warning.main',
                          borderRadius: '50%',
                          border: '2px solid black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {i}
                      </Box>
                    </Box>
                    {i < 5 && <Typography variant="h6">→</Typography>}
                  </React.Fragment>
                ))}
              </Box>
              <Typography variant="body2">
                LEDs are numbered in a line from left to right. The first LED is number 0.
              </Typography>
            </Box>
          )}

          {layout === 'circle' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Circle Layout (LED Ring)
              </Typography>
              <Box sx={{ position: 'relative', width: 300, height: 300, margin: '20px auto' }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const angle = (i * 360) / 8 - 90;
                  const radius = 100;
                  const x = Math.cos((angle * Math.PI) / 180) * radius + 125;
                  const y = Math.sin((angle * Math.PI) / 180) * radius + 125;
                  return (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        transform: 'translate(-50%, -50%)',
                        width: 50,
                        height: 50,
                        bgcolor: i === 0 ? 'error.main' : i === 1 ? 'success.main' : i === 2 ? 'primary.main' : 'warning.main',
                        borderRadius: '50%',
                        border: '2px solid black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {i}
                    </Box>
                  );
                })}
              </Box>
              <Typography variant="body2">
                LEDs are numbered around the circle, starting at the top and going clockwise. Number 0 is at the top.
              </Typography>
            </Box>
          )}

          {layout === 'matrix' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Matrix Layout (LED Grid)
              </Typography>
              <Box sx={{ display: 'inline-block', margin: '20px auto' }}>
                {[0, 1, 2, 3].map((row) => (
                  <Box key={row} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {[0, 1, 2, 3, 4].map((col) => {
                      const index = row * 5 + col;
                      return (
                        <Box
                          key={col}
                          sx={{
                            width: 45,
                            height: 45,
                            bgcolor: index === 0 ? 'error.main' : index === 1 ? 'success.main' : index === 2 ? 'primary.main' : 'warning.main',
                            borderRadius: 1,
                            border: '2px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}
                        >
                          {index}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
              <Typography variant="body2">
                LEDs are numbered like reading a book: left to right, top to bottom. Number 0 is in the top-left corner.
              </Typography>
            </Box>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph>
            Think of NeoPixels like a chain of friends passing messages. You tell the first friend (LED 0) what color to be. 
            That friend remembers their color and passes the rest of the message to the next friend. This keeps going until 
            everyone knows their color!
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Important to Know
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              <strong>Start at 0:</strong> The first LED is always number 0, not 1
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>One wire:</strong> All LEDs connect together with just one data wire
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Order matters:</strong> You must send colors in the right order
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1" gutterBottom>
            To make NeoPixels work safely and reliably, you need two important components: a resistor and a capacitor.
          </Typography>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              330Ω Resistor on Data Line
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Why?</strong> The resistor protects the data signal. It prevents damage from voltage spikes and makes the signal cleaner.
            </Typography>
            <Typography variant="body2">
              Place a 330Ω (ohm) resistor between your controller's data pin and the first NeoPixel's data input (DIN).
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Capacitor on Power Line
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Why?</strong> The capacitor smooths out the power supply. NeoPixels use bursts of power when they change colors, and the capacitor helps provide stable electricity.
            </Typography>
            <Typography variant="body2">
              Use a 1000µF (microfarad) capacitor connected between the +5V and GND (ground) near your NeoPixels. Make sure the + leg connects to +5V and the - leg to GND!
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Safety Tips
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              <strong>Always use these components:</strong> They protect your NeoPixels and controller
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Capacitor polarity:</strong> The capacitor has a + and - side. Connect them correctly!
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Power first:</strong> Connect power to the NeoPixels before sending data signals
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>Don't skip:</strong> Even for small projects, these components are important
            </Typography>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default School;