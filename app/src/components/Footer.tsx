import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { IconButton, Typography } from "@mui/material";
import { School } from "@mui/icons-material";
import useAppStore from "../stores/app";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const toggleShowSchool = useAppStore((state) => state.toggleShowSchool);

  return (
    <Box display="flex" alignItems="center" p={2}>
      <Typography variant="body2" color="textSecondary">
        {t("made_with_love")} Thomas Geissl
      </Typography>
      <Box flex={1}></Box>
      <IconButton onClick={() => toggleShowSchool()}>
        <School></School>
      </IconButton>
    </Box>
  );
};

export default Footer;
