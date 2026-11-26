import React from "react";
import { createRoot } from "react-dom/client";
import { RootApp } from "./app.jsx";
import { AppProviders } from "./context/app-providers.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders><RootApp /></AppProviders>
  </React.StrictMode>,
);
