import { Box } from "@mui/material";
import Header from "./components/Header";
import BlocklyEditor from "./components/BlocklyEditor";
import useAppStore from "./stores/app";
import Settings from "./components/Settings";

function App() {
  const showSettings = useAppStore((state) => state.showSettings);
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      height={"100vh"}
      width={"100vw"}
    >
      <Header />
      <Box flex={1}>
        {showSettings && <Settings />}
        <BlocklyEditor />
      </Box>
    </Box>
  );
}

export default App;
