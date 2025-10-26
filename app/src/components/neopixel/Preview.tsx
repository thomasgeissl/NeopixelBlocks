import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import useAppStore from "../../stores/app";

const Preview = ({ leds = [] }) => {
  const setShowPreview = useAppStore((state) => state.setShowPreview);
  const gridSize = 8;
  const ledSize = 40;
  const spacing = 10;
  const totalSize = gridSize * (ledSize + spacing) + spacing;

  // Fill with default black LEDs if array is incomplete
  const defaultLed = { r: 0, g: 0, b: 0 };
  const ledArray = Array(64)
    .fill(null)
    .map((_, i) => leds[i] || defaultLed);

  const getLEDColor = (led: { r: number; g: number; b: number }) => {
    const { r, g, b } = led;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getGlowIntensity = (led: { r: number; g: number; b: number }) => {
    const { r, g, b } = led;
    const brightness = (r + g + b) / 3;
    return brightness / 255;
  };

  return (
    <Dialog open={true} onClose={() => setShowPreview(false)}>
      <DialogTitle>Preview</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <svg
            width={totalSize}
            height={totalSize}
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            className="bg-gray-800 rounded-lg shadow-2xl"
          >
            <defs>
              {ledArray.map((led, i) => {
                const color = getLEDColor(led);
                const intensity = getGlowIntensity(led);

                return (
                  <radialGradient key={`gradient-${i}`} id={`glow-${i}`}>
                    <stop
                      offset="0%"
                      stopColor={color}
                      stopOpacity={intensity}
                    />
                    <stop
                      offset="50%"
                      stopColor={color}
                      stopOpacity={intensity * 0.5}
                    />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                );
              })}
            </defs>

            {ledArray.map((led, index) => {
              const row = Math.floor(index / gridSize);
              const col = index % gridSize;
              const x = spacing + col * (ledSize + spacing);
              const y = spacing + row * (ledSize + spacing);
              const color = getLEDColor(led);
              const intensity = getGlowIntensity(led);

              return (
                <g key={index}>
                  {/* Glow effect */}
                  {intensity > 0.1 && (
                    <circle
                      cx={x + ledSize / 2}
                      cy={y + ledSize / 2}
                      r={ledSize * 0.8}
                      fill={`url(#glow-${index})`}
                      opacity={intensity}
                    />
                  )}

                  {/* LED body */}
                  <circle
                    cx={x + ledSize / 2}
                    cy={y + ledSize / 2}
                    r={ledSize / 2}
                    fill={color}
                    stroke="#1a1a1a"
                    strokeWidth="2"
                  />

                  {/* Highlight for 3D effect */}
                  <circle
                    cx={x + ledSize / 2 - 8}
                    cy={y + ledSize / 2 - 8}
                    r={ledSize / 6}
                    fill="white"
                    opacity={intensity > 0.1 ? 0.4 : 0.1}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Preview;
