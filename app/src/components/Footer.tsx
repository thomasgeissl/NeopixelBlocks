import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" p={2}>
      <Typography variant="body2" color="textSecondary">
        {t("made_with_love")} Thomas Geissl
      </Typography>
    </Box>
  );
};

export default Footer;
