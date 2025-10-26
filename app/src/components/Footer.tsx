import * as React from "react";
import Box from "@mui/material/Box";

const Footer: React.FC = () => {

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      py={2}
      sx={{ width: "100%" }}
    >
      © {new Date().getFullYear()} Thomas Geissl
    </Box>
  );
};

export default Footer;
