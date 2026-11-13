import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@bare-bones/ui/styles.css";
import "./orb.css";
import { App } from "./App.js";

const container = document.getElementById("root");
if (container === null) throw new Error("Missing #root element.");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
