import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { School, Preview as PreviewIcon } from "@mui/icons-material";
import useAppStore from "../stores/app";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const toggleShowSchool = useAppStore((state) => state.toggleShowSchool);
  const setShowPreview = useAppStore((state) => state.setShowPreview);

  return (
    <Box display="flex" alignItems="center" p={2}>
      <Typography variant="body2" color="textSecondary">
        {t("made_with_love")} 3e8
      </Typography>
      <Box flex={1}></Box>
      <Tooltip title="Open simulator preview">
        <IconButton onClick={() => setShowPreview(true)}>
          <PreviewIcon />
        </IconButton>
      </Tooltip>
      <IconButton onClick={() => toggleShowSchool()}>
        <School />
      </IconButton>
    </Box>
  );
};

export default Footer;
