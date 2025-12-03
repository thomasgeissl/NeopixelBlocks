import * as React from "react";
import useAppStore from "../stores/app";
import TextField from "@mui/material/TextField";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const ip = useAppStore((state) => state.ip);
  const setIp = useAppStore((state) => state.setIp);
  const { t } = useTranslation();
  return (
    <Dialog
      open={true}
      onClose={() => useAppStore.getState().setShowSettings(false)}
    >
      <DialogTitle>{t('settings')}</DialogTitle>
      <DialogContent sx={{paddingTop: 2}}>
        <TextField
          label={t('ip_address')}
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
