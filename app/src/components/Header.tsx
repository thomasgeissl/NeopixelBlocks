// Header.tsx
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Settings } from "@mui/icons-material";
import useAppStore from "../stores/app";
import { IconButton } from "@mui/material";

const Header: React.FC = () => {
    const showSettings = useAppStore((state) => state.showSettings);
    const toggleShowSettings = useAppStore((state) => state.toggleShowSettings);
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.6,
            }}
          >
            Neopixel Blocks
          </Typography>
        </Box>
        <Box flex={1}></Box>
        <Box>
            <IconButton onClick={toggleShowSettings} color={showSettings ? "primary" : "inherit"}>
              <Settings />
            </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
