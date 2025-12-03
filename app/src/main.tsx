import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { registerSW } from 'virtual:pwa-register/react'
import './index.css'
import App from './App.tsx'
import './i18n.ts'


// const updateSW = registerSW({
//   onNeedRefresh() {},
//   onOfflineReady() {},
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
