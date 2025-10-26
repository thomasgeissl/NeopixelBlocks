import { Box } from "@mui/material";
// import Header from "./components/Header";
import BlocklyEditor from "./components/BlocklyEditor";
import useAppStore from "./stores/app";
import Settings from "./components/Settings";
import Footer from "./components/Footer";
import Preview from "./components/neopixel/Preview";

function App() {
  const showSettings = useAppStore((state) => state.showSettings);
  const showPreview = useAppStore((state) => state.showPreview);
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      height={"100vh"}
      width={"100vw"}
    >
      {/* <Header /> */}
      <Box flex={1}>
        <BlocklyEditor />
        {showSettings && <Settings />}
        {showPreview && <Preview />}
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
