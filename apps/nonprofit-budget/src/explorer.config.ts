import type { Derivation, ExplorerConfig, Importer, Metric, Reducer, ShareAdapter, Table, ViewSpec } from "@bare-bones/core";
import { decodeLink, encodeLink, parseCsvText } from "@bare-bones/core";
import { actualRows, derive, expensesOf, incomeOf, plannedRows, sumAmount } from "./data.js";

const csvImporter: Importer = {
  id: "csv", label: "CSV",
  canHandle: ({ fileName }) => fileName.toLowerCase().endsWith(".csv"),
  parse: ({ fileName, text }) => parseCsvText(text, { name: fileName }),
};

/** Derivation: category by rules and month, shared with the app. */
const categoriseDerivation: Derivation = {
  id: "categorise", label: "Category by rules",
  derive: (table) => derive(table),
};

function metricsFor(table: Table): Metric[] {
  const rows = actualRows(table);
  const income = incomeOf(rows);
  const expenses = expensesOf(rows);
  const planned = sumAmount(plannedRows(table));
  const variance = planned === 0 ? 0 : ((planned - expenses) / planned) * 100;
  return [
    { id: "balance", label: "Balance", value: income - expenses, unit: "\u20AC", detail: null },
    { id: "income", label: "Came in", value: income, unit: "\u20AC", detail: null },
    { id: "expenses", label: "Went out", value: expenses, unit: "\u20AC", detail: null },
    { id: "plan", label: "Planned spending", value: planned, unit: "\u20AC", detail: null },
    { id: "variance", label: "Under plan", value: variance, unit: "%", detail: null },
  ];
}

const balanceReducer: Reducer = {
  id: "balance", label: "Balance",
  reduce: (table) => metricsFor(table),
};

const view = (id: string, label: string, columns: string[], kind: "bubble" | "bar" | "delta-bar" | null, title: string | null): ViewSpec => ({
  id, label, description: null, columns,
  chart: kind === null ? null : { kind, x: kind === "bar" || kind === "delta-bar" ? "category" : "category", y: "amount", series: null, title },
  filters: [],
});

const views: ViewSpec[] = [
  view("overview", "Overview", ["date", "label", "category", "amount"], "bubble", "Where the money went"),
  view("transactions", "Transactions", ["date", "label", "category", "amount"], null, null),
  view("categories", "Categories", ["category", "amount"], "bar", "Spending by category"),
  view("actual-vs-plan", "Actual vs plan", ["category", "amount"], "delta-bar", "Actual vs plan"),
  view("rejected-rows", "Rejected rows", [], null, null),
];

const adapter = (id: string, label: string, mode: "public" | "private"): ShareAdapter => ({
  id, label, mode,
  encode: (payload) => encodeLink(payload, mode),
  decode: async (token) => (await decodeLink(token)).payload,
});

export const explorerConfig: ExplorerConfig = {
  id: "nonprofit-budget",
  title: "Fern Street Budget",
  importers: [csvImporter],
  derivations: [categoriseDerivation],
  reducers: [balanceReducer],
  views,
  shareAdapters: [adapter("private", "Private \u00b7 encrypted", "private"), adapter("public", "Public \u00b7 view only", "public")],
  theme: {
    colors: {
      background: "#F4F3F0", surface: "#FFFFFF", soft: "#F4F3F0", "soft-2": "#EDEBE7",
      ink: "#141414", "ink-2": "rgba(20,20,20,.62)", "ink-3": "rgba(20,20,20,.42)",
      line: "rgba(20,20,20,.07)", "line-2": "rgba(20,20,20,.13)",
      accent: "#1E8A5A", good: "#1E8A5A", neutral: "#9C968B", bad: "#D4512A",
      "orb-activities": "radial-gradient(circle at 32% 28%, #FFE3C8 0, #F58A5A 38%, #E0573A 70%, #B8402E)",
      "orb-events": "radial-gradient(circle at 32% 28%, #F6DDFF 0, #B77BF0 40%, #7B4BD1 78%, #5A35A8)",
      "orb-premises": "radial-gradient(circle at 32% 28%, #D9EBFF 0, #7FA8F0 42%, #4D74D6 80%)",
      "orb-fixed-costs": "radial-gradient(circle at 32% 28%, #F3F1EC 0, #C9C4BA 45%, #9C968B 85%)",
      "orb-grants": "radial-gradient(circle at 32% 28%, #E1F7E9 0, #7FD3A6 42%, #2FA472 82%)",
      "orb-other": "radial-gradient(circle at 32% 28%, #FFF4C9 0, #F4D06A 42%, #D9A62A 85%)",
    },
    fonts: { sans: "Inter, system-ui, sans-serif", mono: "'Geist Mono', ui-monospace, monospace", serif: "'Instrument Serif', Georgia, serif" },
    radii: { card: "22px", pill: "999px" },
    spacing: { unit: "8px" },
  },
  i18n: { locale: "en", strings: {} },
};
