import type { ExplorerConfig, Importer, Reducer, ShareAdapter, ViewSpec } from "@bare-bones/core";
import { decodeLink, encodeLink, parseCsvText } from "@bare-bones/core";
import { derive, headlineMetrics } from "./data.js";

const csvImporter: Importer = {
  id: "csv", label: "CSV",
  canHandle: ({ fileName }) => fileName.toLowerCase().endsWith(".csv"),
  parse: ({ fileName, text }) => {
    const outcome = parseCsvText(text, { name: fileName });
    return { table: derive(outcome.table), warnings: outcome.warnings };
  },
};

const standingsReducer: Reducer = {
  id: "standings", label: "Standings",
  reduce: (table) => headlineMetrics(table),
};

const views: ViewSpec[] = [
  { id: "league-table", label: "League table", description: null, columns: [], chart: null, filters: [] },
  { id: "team", label: "Team", description: null, columns: [], chart: null, filters: [] },
  { id: "results", label: "Results", description: null, columns: ["date", "week", "home", "away", "home-goals", "away-goals"], chart: null, filters: [] },
];

const publicAdapter: ShareAdapter = {
  id: "public", label: "Public · view only", mode: "public",
  encode: (payload) => encodeLink(payload, "public"),
  decode: async (token) => (await decodeLink(token)).payload,
};

export const explorerConfig: ExplorerConfig = {
  id: "club-results",
  title: "Riverside Six",
  importers: [csvImporter],
  derivations: [{ id: "match-facts", label: "Outcome and points", derive }],
  reducers: [standingsReducer],
  views,
  shareAdapters: [publicAdapter],
  theme: {
    colors: {
      background: "#05070C", surface: "#0A1120", soft: "rgba(238,242,247,.05)", "soft-2": "rgba(238,242,247,.08)",
      ink: "#EEF2F7", "ink-2": "rgba(238,242,247,.68)", "ink-3": "rgba(238,242,247,.44)",
      line: "rgba(238,242,247,.12)", "line-2": "rgba(238,242,247,.2)",
      accent: "#7DD3FC", good: "#22C55E", neutral: "#64748B", bad: "#EF4444",
    },
    fonts: { sans: "'Inter Tight', Inter, system-ui, sans-serif", mono: "'Geist Mono', ui-monospace, monospace", serif: "'Inter Tight', serif" },
    radii: { card: "18px", pill: "999px" },
    spacing: { unit: "8px" },
  },
  i18n: { locale: "en", strings: {} },
};
