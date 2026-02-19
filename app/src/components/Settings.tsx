import * as React from "react";
import useAppStore from "../stores/app";
import type { SimulatorLayout } from "../stores/app";
import TextField from "@mui/material/TextField";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Radio,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const LAYOUT_LABELS: Record<SimulatorLayout, string> = {
  line: "Line",
  matrix: "Matrix",
  ring: "Ring",
};

const Settings: React.FC = () => {
  const ip = useAppStore((state) => state.ip);
  const setIp = useAppStore((state) => state.setIp);
  const simulatorLayouts = useAppStore((state) => state.simulatorLayouts) ?? [];
  const activeSimulatorLayoutId = useAppStore((state) => state.activeSimulatorLayoutId);
  const setActiveSimulatorLayout = useAppStore((state) => state.setActiveSimulatorLayout);
  const addSimulatorLayout = useAppStore((state) => state.addSimulatorLayout);
  const updateSimulatorLayout = useAppStore((state) => state.updateSimulatorLayout);
  const removeSimulatorLayout = useAppStore((state) => state.removeSimulatorLayout);
  const { t } = useTranslation();

  const handleAddLayout = () => {
    addSimulatorLayout({
      name: "New layout",
      type: "matrix",
      pixelCount: 64,
    });
  };

  return (
    <Dialog
      open={true}
      onClose={() => useAppStore.getState().setShowSettings(false)}
    >
      <DialogTitle>{t("settings")}</DialogTitle>
      <DialogContent sx={{ paddingTop: 2, minWidth: 360 }}>
        <TextField
          label={t("ip_address")}
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Simulator layouts
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Choose which layout to use when simulating. You can add and edit layouts below.
        </Typography>
        <List dense sx={{ bgcolor: "action.hover", borderRadius: 1, mb: 2 }}>
          {simulatorLayouts.map((layout) => (
            <ListItem
              key={layout.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => removeSimulatorLayout(layout.id)}
                  disabled={simulatorLayouts.length <= 1}
                >
                  <Delete fontSize="small" />
                </IconButton>
              }
            >
              <Radio
                checked={activeSimulatorLayoutId === layout.id}
                onChange={() => setActiveSimulatorLayout(layout.id)}
                size="small"
                sx={{ mr: 0.5 }}
              />
              <ListItemText
                primary={
                  <Box component="span" display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <TextField
                      size="small"
                      value={layout.name}
                      onChange={(e) => updateSimulatorLayout(layout.id, { name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ minWidth: 100, ".MuiInputBase-input": { py: 0.25, fontSize: "0.875rem" } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <Select
                        value={layout.type}
                        onChange={(e) => updateSimulatorLayout(layout.id, { type: e.target.value as SimulatorLayout })}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ ".MuiSelect-select": { py: 0.25 } }}
                      >
                        {(Object.keys(LAYOUT_LABELS) as SimulatorLayout[]).map((type) => (
                          <MenuItem key={type} value={type}>
                            {LAYOUT_LABELS[type]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      type="number"
                      size="small"
                      value={layout.pixelCount}
                      onChange={(e) =>
                        updateSimulatorLayout(layout.id, {
                          pixelCount: parseInt(e.target.value, 10) || 64,
                        })
                      }
                      inputProps={{ min: 1, max: 512 }}
                      sx={{ width: 72, ".MuiInputBase-input": { py: 0.25, fontSize: "0.875rem" } }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={handleAddLayout}
          variant="outlined"
        >
          Add layout
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
