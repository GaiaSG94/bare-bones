import type { ExplorerConfig, Importer } from "@bare-bones/core";
import { parseCsvText } from "@bare-bones/core";

const csvImporter: Importer = {
  id: "csv",
  label: "CSV",
  canHandle: ({ fileName }) => fileName.toLowerCase().endsWith(".csv"),
  parse: ({ fileName, text }) => parseCsvText(text, { name: fileName }),
};

/**
 * The whole customization surface of an app: five registries plus a
 * theme and a dictionary. Nothing else is needed to get an explorer.
 */
export const explorerConfig: ExplorerConfig = {
  id: "skeleton",
  title: "Bare Bones starter",
  importers: [csvImporter],
  derivations: [],
  reducers: [],
  views: [
    {
      id: "table",
      label: "Table",
      description: "Every row of the file, typed.",
      columns: [],
      chart: null,
      filters: [],
    },
  ],
  shareAdapters: [],
  theme: {
    colors: {
      background: "#F4F3F0",
      surface: "#FFFFFF",
      ink: "#141414",
      muted: "rgba(20,20,20,.62)",
      accent: "#1E8A5A",
      line: "rgba(20,20,20,.10)",
      good: "#1E8A5A",
      neutral: "#9C968B",
      bad: "#D4512A",
    },
    fonts: {
      sans: "Inter, system-ui, sans-serif",
      mono: "'Geist Mono', ui-monospace, monospace",
    },
    radii: { card: "22px", pill: "999px" },
    spacing: { unit: "8px" },
  },
  i18n: {
    locale: "en",
    strings: {},
  },
};
