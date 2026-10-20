import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { claimChunkRecovery } from "./utils/chunkRecovery";
import "./styles/global.css";
// GitHub Pages replaces hashed chunks on deployment. An older open tab can
// recover its lazy imports by loading the current entry document once.
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (!claimChunkRecovery(window.sessionStorage, import.meta.url)) return;
    event.preventDefault();
    window.location.reload();
  } catch {
    // Preserve the existing accessible error fallback if storage is blocked.
  }
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
