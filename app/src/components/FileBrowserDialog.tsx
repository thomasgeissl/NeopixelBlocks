import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ExamplesChooser from "./ExampleChooser";

interface File {
  id: string;
  name: string;
  updatedAt: number;
}

interface FileBrowserDialogProps {
  open: boolean;
  files: File[];
  onClose: () => void;
  onOpenFile: (fileId: string) => void;
  onDeleteFile: (fileId: string, event: React.MouseEvent) => void;
}

const FileBrowserDialog = ({
  open,
  files,
  onClose,
  onOpenFile,
  onDeleteFile,
}: FileBrowserDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Open File</DialogTitle>
      <DialogContent>
        <List>
          {files.map((file) => (
            <ListItem
              key={file.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => onDeleteFile(file.id, e)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => onOpenFile(file.id)}>
                <ListItemText
                  primary={file.name}
                  secondary={new Date(file.updatedAt).toLocaleString()}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <ExamplesChooser />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileBrowserDialog;