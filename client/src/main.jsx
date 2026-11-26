import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.jsx";
import { AppProviders } from "./context/app-providers.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders><App /></AppProviders>
  </React.StrictMode>,
);
