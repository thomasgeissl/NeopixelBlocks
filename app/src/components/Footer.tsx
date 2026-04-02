import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { IconButton, Link, Tooltip, Typography } from "@mui/material";
import { School, Preview as PreviewIcon, Handyman as ToolsIcon } from "@mui/icons-material";
import useAppStore from "../stores/app";
import { isTauri } from "../utils/isTauri";
import { getPlatform } from "../utils/getPlatform";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const toggleShowSchool = useAppStore((state) => state.toggleShowSchool);
  const setShowPreview = useAppStore((state) => state.setShowPreview);
  const setShowTools = useAppStore((state) => state.setShowTools);
  const runningInTauri = isTauri();
  const platform = getPlatform();

  return (
    <Box display="flex" alignItems="center" p={2}>
      <Typography variant="body2" color="textSecondary">
        {t("made_with_love")}{" "}
        <Link href="https://3e8.studio" target="_blank">
          3e8
        </Link>
      </Typography>
      <Box flex={1}></Box>
      {!runningInTauri && platform === "other" && (
        <Link
          href="https://github.com/thomasgeissl/NeopixelBlocks/releases/latest"
          target="_blank"
          sx={{ mr: 2 }}
        >
          Download desktop app
        </Link>
      )}
      <Tooltip title="Open simulator preview">
        <IconButton onClick={() => setShowPreview(true)}>
          <PreviewIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open tools (3D model viewer)">
        <IconButton onClick={() => setShowTools(true)}>
          <ToolsIcon />
        </IconButton>
      </Tooltip>
      <IconButton onClick={() => toggleShowSchool()}>
        <School />
      </IconButton>
    </Box>
  );
};

export default Footer;
