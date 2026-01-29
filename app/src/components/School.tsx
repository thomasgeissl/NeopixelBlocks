import * as React from "react";
import useAppStore from "../stores/app";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SystemArchitecture from "./school/SystemArchitecture";
import Electronics from "./school/Electronics";
import RgbColors from "./school/RgbColors";
import LedAddressing from "./school/LedAddressing";
import Programming from "./school/Programming";

const School: React.FC = () => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={true}
      onClose={() => useAppStore.getState().toggleShowSchool()}
      maxWidth="md"
      fullWidth
      sx={{minHeight: '80vh'}}
    >
      <DialogTitle>{t("information")}</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="rgb and neopixel tabs"
          >
            <Tab label={t("rgbColors")} id="tab-0" aria-controls="tabpanel-0" />
            <Tab
              label={t("neopixelAddressing")}
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab
              label={t("programming")}
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              label={t("electronics")}
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              label={t("systemArchitecture")}
              id="tab-3"
              aria-controls="tabpanel-3"
            />
          </Tabs>
        </Box>

        <LedAddressing tabValue={tabValue} index={0} />
        <RgbColors tabValue={tabValue} index={1} />
        <Programming tabValue={tabValue} index={2} />
        <Electronics tabValue={tabValue} index={3} />
        <SystemArchitecture tabValue={tabValue} index={4} />
      </DialogContent>
    </Dialog>
  );
};

export default School;
