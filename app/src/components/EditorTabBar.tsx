import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Add, FolderOpen, MoreVert } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useAppStore from "../stores/app";

interface TabData {
  id: string;
  fileId: string;
}

interface FileData {
  id: string;
  name: string;
}

interface EditorTabBarProps {
  tabs: TabData[];
  activeTabId: string | null;
  getFile: (fileId: string) => FileData | undefined;
  onTabChange: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewFile: () => void;
  onOpenFileDialog: () => void;
  onExportTab: (tabId: string) => void;
}

const EditorTabBar = ({
  tabs,
  activeTabId,
  getFile,
  onTabChange,
  onCloseTab,
  onNewFile,
  onOpenFileDialog,
  onExportTab,
}: EditorTabBarProps) => {
  const renameFile = useAppStore((state) => state.renameFile);
  const { t } = useTranslation();
  const [tabMenu, setTabMenu] = useState<{
    anchorEl: HTMLElement;
    tabId: string;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    tabId: string;
    currentName: string;
  } | null>(null);
  const [newName, setNewName] = useState("");


  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    tabId: string,
  ) => {
    event.stopPropagation();
    setTabMenu({
      anchorEl: event.currentTarget,
      tabId,
    });
  };

  const handleCloseMenu = () => {
    setTabMenu(null);
  };

  const handleRenameClick = () => {
    if (tabMenu) {
      const file = getFile(
        tabs.find((t) => t.id === tabMenu.tabId)?.fileId || "",
      );
      setRenameDialog({
        tabId: tabMenu.tabId,
        currentName: file?.name || "",
      });
      setNewName(file?.name || "");
      handleCloseMenu();
    }
  };

  const handleRenameSubmit = () => {
    if (renameDialog && newName.trim()) {
      const tab = tabs.find((t) => t.id === renameDialog.tabId);
      if (tab) {
        renameFile(tab.fileId, newName.trim());
      }
      setRenameDialog(null);
      setNewName("");
    }
  };

  const handleRenameCancel = () => {
    setRenameDialog(null);
    setNewName("");
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        borderBottom={1}
        borderColor="divider"
      >
        <Tooltip title={t("open_file")}>
          <IconButton onClick={onOpenFileDialog} size="small" sx={{ mr: 1 }}>
            <FolderOpen />
          </IconButton>
        </Tooltip>
        <Tabs
          value={activeTabId || false}
          onChange={(_, newValue) => onTabChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => {
            const file = getFile(tab.fileId);
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <span>{file?.name || "Untitled"}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, tab.id)}
                      sx={{ padding: 0.5 }}
                    >
                      <MoreVert sx={{ fontSize: 16 }} />
                    </IconButton>
                    {/* <IconButton
                      size="small"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      sx={{ padding: 0.5 }}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton> */}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
        <Tooltip title={t("new_file")}>
          <IconButton onClick={onNewFile} size="small" sx={{ ml: 1 }}>
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        open={!!tabMenu}
        onClose={handleCloseMenu}
        anchorEl={tabMenu?.anchorEl}
      >
        <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
        <MenuItem
          onClick={() => {
            if (tabMenu) {
              onExportTab(tabMenu.tabId);
              handleCloseMenu();
            }
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (tabMenu) {
              onCloseTab(tabMenu.tabId);
              handleCloseMenu();
            }
          }}
        >
          Close
        </MenuItem>
      </Menu>

      <Dialog open={!!renameDialog} onClose={handleRenameCancel}>
        <DialogTitle>Rename File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameCancel}>Cancel</Button>
          <Button onClick={handleRenameSubmit} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditorTabBar;
