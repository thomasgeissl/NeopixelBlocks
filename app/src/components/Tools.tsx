import * as React from "react";
import { Dialog, DialogContent, DialogTitle, Box } from "@mui/material";
import useAppStore from "../stores/app";
import ModelViewer3D from "./ModelViewer3D";

const Tools: React.FC = () => {
  const setShowTools = useAppStore((state) => state.setShowTools);

  return (
    <Dialog
      open={true}
      onClose={() => setShowTools(false)}
      maxWidth={false}
      fullWidth
    >
      <DialogTitle>Tools</DialogTitle>
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box sx={{ width: "100%", height: "70vh", minHeight: 420 }}>
          <ModelViewer3D height="100%" />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Tools;

