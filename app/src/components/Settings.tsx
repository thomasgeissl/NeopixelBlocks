import * as React from "react";
import useAppStore from "../stores/app";
import TextField from "@mui/material/TextField";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const Settings: React.FC = () => {
  const ip = useAppStore((state) => state.ip);
  const setIp = useAppStore((state) => state.setIp);
  return (
    <Dialog
      open={true}
      onClose={() => useAppStore.getState().setShowSettings(false)}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{paddingTop: 2}}>
        <TextField
          label="IP Address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
