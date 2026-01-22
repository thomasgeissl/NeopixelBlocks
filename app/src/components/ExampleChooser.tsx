import React from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import useAppStore from "../stores/app";
import type { File } from "../stores/app";

const ExamplesChooser: React.FC = () => {
  const examples = useAppStore((state) => state.examples);

  if (!examples || examples.length === 0) {
    return <Typography variant="body2">No examples available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Examples
      </Typography>
      <List>
        {examples.map((example: File) => (
          <ListItem
            key={example.id}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <ListItemText
              primary={example.name}
              secondary={`Created: ${new Date(example.createdAt).toLocaleDateString()}`}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
  console.log("=== BEFORE IMPORT ===");
  console.log("Example:", example);
  console.log("Example.content:", example.content);
  console.log("Type of content:", typeof example.content);
  
  const fileId = useAppStore.getState().importFile({
    name: example.name,
    content: example.content,
  });
  
  console.log("=== AFTER IMPORT ===");
  console.log("FileId:", fileId);
  
  // Check what's actually in the store now
  const file = useAppStore.getState().getFile(fileId);
  console.log("File in store:", file);
  console.log("File content in store:", file?.content);
}
}
            >
              Load
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExamplesChooser;