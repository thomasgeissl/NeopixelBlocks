import { Box } from "@mui/material";
// import Header from "./components/Header";
import BlocklyEditor from "./components/BlocklyEditor";
import useAppStore from "./stores/app";
import Settings from "./components/Settings";
import Footer from "./components/Footer";
import Preview from "./components/neopixel/Preview";
import School from "./components/School";

function App() {
  const showSettings = useAppStore((state) => state.showSettings);
  const showPreview = useAppStore((state) => state.showPreview);
  const showSchool = useAppStore((state) => state.showSchool);
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      height={"100vh"}
      width={"100vw"}
    >
      {/* <Header /> */}
      <Box flex={1} display={"flex"} flexDirection={"column"}>
        <BlocklyEditor />
        {showSettings && <Settings />}
        {showSchool && <School />}
        {showPreview && <Preview />}
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
