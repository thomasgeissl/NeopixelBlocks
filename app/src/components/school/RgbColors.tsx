import { Box, Button, Slider, Typography } from "@mui/material";
import TabPanel from "./TabPanel";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const RgbColors = ({
  tabValue,
  index,
}: {
  tabValue: number;
  index: number;
}) => {
  const { t } = useTranslation();
  const [r, setR] = useState(255);
  const [g, setG] = useState(128);
  const [b, setB] = useState(0);
  const rgbColor = `rgb(${r}, ${g}, ${b})`;
  const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  return (
    <TabPanel value={tabValue} index={index}>
      <Typography variant="body1" gutterBottom></Typography>
      <Typography variant="body1" gutterBottom>
        {t("rgbRange")}
      </Typography>

      <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="subtitle2" sx={{ width: "100%", mb: 1 }}>
          {t("rgbPresetColors")}:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(255);
            setG(165);
            setB(0);
          }}
        >
          {t("orange")}:
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(128);
            setG(0);
            setB(128);
          }}
        >
          {t("purple")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(255);
            setG(255);
            setB(0);
          }}
        >
          {t("yellow")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(0);
            setG(255);
            setB(255);
          }}
        >
          {t("cyan")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(255);
            setG(192);
            setB(203);
          }}
        >
          {t("pink")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(255);
            setG(255);
            setB(255);
          }}
        >
          {t("white")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setR(0);
            setG(0);
            setB(0);
          }}
        >
          {t("black")}
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {t("red")}: {r}
        </Typography>
        <Slider
          value={r}
          onChange={(_, val) => setR(val as number)}
          min={0}
          max={255}
          sx={{ color: "error.main" }}
        />

        <Typography
          variant="h6"
          color="success.main"
          gutterBottom
          sx={{ mt: 3 }}
        >
          {t("green")}: {g}
        </Typography>
        <Slider
          value={g}
          onChange={(_, val) => setG(val as number)}
          min={0}
          max={255}
          sx={{ color: "success.main" }}
        />

        <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
          {t("blue")}: {b}
        </Typography>
        <Slider
          value={b}
          onChange={(_, val) => setB(val as number)}
          min={0}
          max={255}
          sx={{ color: "primary.main" }}
        />

        <Box sx={{ mt: 4, display: "flex", gap: 3, alignItems: "center" }}>
          <Box
            sx={{
              width: 200,
              height: 200,
              backgroundColor: rgbColor,
              border: "2px solid #ccc",
              borderRadius: 2,
              boxShadow: 3,
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
  );
};
export default RgbColors;
