// TabPanel.tsx
import { Box } from "@mui/material";
import * as React from "react";

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  if (value !== index) return null;

  return (
    <div role="tabpanel" id={`tabpanel-${index}`}>
      <Box sx={{ pt: 3 }}>{children}</Box>
    </div>
  );
};

export default TabPanel;
