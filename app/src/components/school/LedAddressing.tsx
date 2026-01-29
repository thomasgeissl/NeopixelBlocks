import { Box, Button, Typography } from "@mui/material";
import TabPanel from "./TabPanel";
import { Fragment, useState } from "react";

const LedAddressing = ({
  tabValue,
  index,
}: {
  tabValue: number;
  index: number;
}) => {
  const [layout, setLayout] = useState<"line" | "circle" | "matrix">("line");
  return (
    <TabPanel value={tabValue} index={index}>
      <Typography variant="body1" gutterBottom>
        NeoPixels are smart LEDs that you can control one by one. Each LED has a
        number starting from 0.
      </Typography>

      <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        <Typography variant="subtitle2" sx={{ width: "100%", mb: 1 }}>
          Choose a layout:
        </Typography>
        <Button
          variant={layout === "line" ? "contained" : "outlined"}
          size="small"
          onClick={() => setLayout("line")}
        >
          Line (Strip)
        </Button>
        <Button
          variant={layout === "circle" ? "contained" : "outlined"}
          size="small"
          onClick={() => setLayout("circle")}
        >
          Circle (Ring)
        </Button>
        <Button
          variant={layout === "matrix" ? "contained" : "outlined"}
          size="small"
          onClick={() => setLayout("matrix")}
        >
          Matrix (Grid)
        </Button>
      </Box>

      {layout === "line" && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Line Layout (LED Strip)
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              my: 2,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Fragment key={i}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor:
                        i === 0
                          ? "error.main"
                          : i === 1
                            ? "success.main"
                            : i === 2
                              ? "primary.main"
                              : "warning.main",
                      borderRadius: "50%",
                      border: "2px solid black",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {i}
                  </Box>
                </Box>
                {i < 5 && <Typography variant="h6">→</Typography>}
              </Fragment>
            ))}
          </Box>
          <Typography variant="body2">
            LEDs are numbered in a line from left to right. The first LED is
            number 0.
          </Typography>
        </Box>
      )}

      {layout === "circle" && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Circle Layout (LED Ring)
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: 300,
              height: 300,
              margin: "20px auto",
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i * 360) / 8 - 90;
              const radius = 100;
              const x = Math.cos((angle * Math.PI) / 180) * radius + 125;
              const y = Math.sin((angle * Math.PI) / 180) * radius + 125;
              return (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    left: x,
                    top: y,
                    transform: "translate(-50%, -50%)",
                    width: 50,
                    height: 50,
                    bgcolor:
                      i === 0
                        ? "error.main"
                        : i === 1
                          ? "success.main"
                          : i === 2
                            ? "primary.main"
                            : "warning.main",
                    borderRadius: "50%",
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {i}
                </Box>
              );
            })}
          </Box>
          <Typography variant="body2">
            LEDs are numbered around the circle, starting at the top and going
            clockwise. Number 0 is at the top.
          </Typography>
        </Box>
      )}

      {layout === "matrix" && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Matrix Layout (LED Grid)
          </Typography>
          <Box sx={{ display: "inline-block", margin: "20px auto" }}>
            {[0, 1, 2, 3].map((row) => (
              <Box key={row} sx={{ display: "flex", gap: 1, mb: 1 }}>
                {[0, 1, 2, 3, 4].map((col) => {
                  const index = row * 5 + col;
                  return (
                    <Box
                      key={col}
                      sx={{
                        width: 45,
                        height: 45,
                        bgcolor:
                          index === 0
                            ? "error.main"
                            : index === 1
                              ? "success.main"
                              : index === 2
                                ? "primary.main"
                                : "warning.main",
                        borderRadius: 1,
                        border: "2px solid black",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
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
            LEDs are numbered like reading a book: left to right, top to bottom.
            Number 0 is in the top-left corner.
          </Typography>
        </Box>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        How It Works
      </Typography>
      <Typography variant="body1" paragraph>
        Think of NeoPixels like a chain of friends passing messages. You tell
        the first friend (LED 0) what color to be. That friend remembers their
        color and passes the rest of the message to the next friend. This keeps
        going until everyone knows their color!
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Important to Know
      </Typography>
      <Box component="ul" sx={{ pl: 3 }}>
        <Typography component="li" variant="body2" paragraph>
          <strong>Start at 0:</strong> The first LED is always number 0, not 1
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          <strong>One wire:</strong> All LEDs connect together with just one
          data wire
        </Typography>
        <Typography component="li" variant="body2" paragraph>
          <strong>Order matters:</strong> You must send colors in the right
          order
        </Typography>
      </Box>
    </TabPanel>
  );
};

export default LedAddressing;
