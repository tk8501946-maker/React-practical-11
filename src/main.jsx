import React from "react";
import { createRoot } from "react-dom/client";
import App from "./router-example/App";

// Note: The previous EduConnect code has been safely backed up to src/main.educonnect.bak.jsx
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
