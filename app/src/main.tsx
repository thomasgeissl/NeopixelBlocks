import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from './App.tsx'
import './i18n.ts'
import theme from './MuiTheme.ts';


// const updateSW = registerSW({
//   onNeedRefresh() {},
//   onOfflineReady() {},
// });

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
)
