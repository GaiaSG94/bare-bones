import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Explorer } from "@bare-bones/ui";
import "@bare-bones/ui/styles.css";
import { explorerConfig } from "./explorer.config.js";

const container = document.getElementById("root");
if (container === null) throw new Error("Missing #root element.");

createRoot(container).render(
  <StrictMode>
    <Explorer
      config={explorerConfig}
      demoDataUrl="./data/demo.csv"
      defaultShareMode="public"
      backHref="../"
    />
  </StrictMode>,
);
