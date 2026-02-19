import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { PlayArrow, Stop as StopIcon } from "@mui/icons-material";
import useAppStore from "../../stores/app";
const defaultLed = { r: 0, g: 0, b: 0 };

const getLEDColor = (led: { r: number; g: number; b: number }) => {
  const { r, g, b } = led;
  return `rgb(${r}, ${g}, ${b})`;
};

const getGlowIntensity = (led: { r: number; g: number; b: number }) => {
  const { r, g, b } = led;
  const brightness = (r + g + b) / 3;
  return brightness / 255;
};

const Preview = () => {
  const setShowPreview = useAppStore((state) => state.setShowPreview);
  const getActiveSimulatorLayout = useAppStore((state) => state.getActiveSimulatorLayout);
  const simulatorLayouts = useAppStore((state) => state.simulatorLayouts) ?? [];
  const activeSimulatorLayoutId = useAppStore((state) => state.activeSimulatorLayoutId);
  const setActiveSimulatorLayout = useAppStore((state) => state.setActiveSimulatorLayout);
  const isRunning = useAppStore((state) => state.isRunning);
  const requestSimulatorRun = useAppStore((state) => state.requestSimulatorRun);
  const requestSimulatorStop = useAppStore((state) => state.requestSimulatorStop);
  const simulatorLeds = useAppStore((state) => state.simulatorLeds) ?? [];
  const simulatorVariables = useAppStore((state) => state.simulatorVariables) ?? {};

  const activeLayout = getActiveSimulatorLayout();
  const simulatorLayout = activeLayout?.type ?? "matrix";
  const simulatorPixelCount = activeLayout?.pixelCount ?? 64;

  const ledArray = Array(simulatorPixelCount)
    .fill(null)
    .map((_, i) => simulatorLeds[i] || defaultLed);

  const ledSize = 40;
  const spacing = 10;

  const renderMatrix = () => {
    const cols = Math.ceil(Math.sqrt(simulatorPixelCount));
    const rows = Math.ceil(simulatorPixelCount / cols);
    const totalWidth = cols * (ledSize + spacing) + spacing;
    const totalHeight = rows * (ledSize + spacing) + spacing;

    return (
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="bg-gray-800 rounded-lg shadow-2xl"
      >
        <defs>
          {ledArray.map((led, i) => {
            const color = getLEDColor(led);
            const intensity = getGlowIntensity(led);
            return (
              <radialGradient key={`gradient-${i}`} id={`glow-${i}`}>
                <stop offset="0%" stopColor={color} stopOpacity={intensity} />
                <stop offset="50%" stopColor={color} stopOpacity={intensity * 0.5} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>
        {ledArray.map((led, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = spacing + col * (ledSize + spacing);
          const y = spacing + row * (ledSize + spacing);
          const color = getLEDColor(led);
          const intensity = getGlowIntensity(led);
          const cx = x + ledSize / 2;
          const cy = y + ledSize / 2;
          return (
            <g key={index}>
              {intensity > 0.1 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={ledSize * 0.8}
                  fill={`url(#glow-${index})`}
                  opacity={intensity}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={ledSize / 2}
                fill={color}
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <circle
                cx={cx - 8}
                cy={cy - 8}
                r={ledSize / 6}
                fill="white"
                opacity={intensity > 0.1 ? 0.4 : 0.1}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderLine = () => {
    const totalWidth = simulatorPixelCount * (ledSize + spacing) + spacing;
    const totalHeight = ledSize + 2 * spacing;

    return (
      <svg
        width={Math.min(totalWidth, 800)}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="bg-gray-800 rounded-lg shadow-2xl"
      >
        <defs>
          {ledArray.map((led, i) => {
            const color = getLEDColor(led);
            const intensity = getGlowIntensity(led);
            return (
              <radialGradient key={`gradient-${i}`} id={`glow-line-${i}`}>
                <stop offset="0%" stopColor={color} stopOpacity={intensity} />
                <stop offset="50%" stopColor={color} stopOpacity={intensity * 0.5} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>
        {ledArray.map((led, index) => {
          const x = spacing + index * (ledSize + spacing) + ledSize / 2;
          const y = spacing + ledSize / 2;
          const color = getLEDColor(led);
          const intensity = getGlowIntensity(led);
          return (
            <g key={index}>
              {intensity > 0.1 && (
                <circle
                  cx={x}
                  cy={y}
                  r={ledSize * 0.8}
                  fill={`url(#glow-line-${index})`}
                  opacity={intensity}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={ledSize / 2}
                fill={color}
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <circle
                cx={x - 8}
                cy={y - 8}
                r={ledSize / 6}
                fill="white"
                opacity={intensity > 0.1 ? 0.4 : 0.1}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderRing = () => {
    const radius = Math.max(120, simulatorPixelCount * 4);
    const centerX = radius + spacing * 2;
    const centerY = radius + spacing * 2;
    const size = radius * 2 + spacing * 4;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="bg-gray-800 rounded-lg shadow-2xl"
      >
        <defs>
          {ledArray.map((led, i) => {
            const color = getLEDColor(led);
            const intensity = getGlowIntensity(led);
            return (
              <radialGradient key={`gradient-${i}`} id={`glow-ring-${i}`}>
                <stop offset="0%" stopColor={color} stopOpacity={intensity} />
                <stop offset="50%" stopColor={color} stopOpacity={intensity * 0.5} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>
        {ledArray.map((led, index) => {
          const angle = (index / simulatorPixelCount) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const color = getLEDColor(led);
          const intensity = getGlowIntensity(led);
          return (
            <g key={index}>
              {intensity > 0.1 && (
                <circle
                  cx={x}
                  cy={y}
                  r={ledSize * 0.8}
                  fill={`url(#glow-ring-${index})`}
                  opacity={intensity}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={ledSize / 2}
                fill={color}
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <circle
                cx={x - 8}
                cy={y - 8}
                r={ledSize / 6}
                fill="white"
                opacity={intensity > 0.1 ? 0.4 : 0.1}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderLayout = () => {
    switch (simulatorLayout) {
      case "line":
        return renderLine();
      case "ring":
        return renderRing();
      case "matrix":
      default:
        return renderMatrix();
    }
  };

  return (
    <Dialog open={true} onClose={() => setShowPreview(false)} maxWidth={false}>
      <DialogTitle>Simulator</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {!isRunning ? (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<PlayArrow />}
              onClick={() => requestSimulatorRun()}
            >
              Run
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<StopIcon />}
              onClick={() => requestSimulatorStop()}
            >
              Stop
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="preview-choose-layout">Choose layout</InputLabel>
            <Select
              labelId="preview-choose-layout"
              label="Choose layout"
              value={activeSimulatorLayoutId ?? (activeLayout?.id ?? "")}
              onChange={(e) => setActiveSimulatorLayout(e.target.value || null)}
            >
              {simulatorLayouts.map((layout) => (
                <MenuItem key={layout.id} value={layout.id}>
                  {layout.name} ({layout.type}, {layout.pixelCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <div className="flex items-center justify-center min-h-[200px] bg-gray-900 p-4">
            {renderLayout()}
          </div>
          {Object.keys(simulatorVariables).length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, minWidth: 180, flexShrink: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Variable inspector
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Variable</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(simulatorVariables).map(([name, value]) => (
                    <TableRow key={name}>
                      <TableCell component="th" scope="row" sx={{ fontFamily: "monospace" }}>
                        {name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {value === undefined
                          ? "—"
                          : typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Preview;
