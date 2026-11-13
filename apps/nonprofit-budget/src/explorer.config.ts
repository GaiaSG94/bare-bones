import type {
  Derivation,
  ExplorerConfig,
  Importer,
  Metric,
  Query,
  Reducer,
  ShareAdapter,
  Table,
  ViewSpec,
} from "@bare-bones/core";
import { decodeLink, encodeLink, parseCsvText } from "@bare-bones/core";
import {
  actualRows,
  categorise,
  derive,
  expensesOf,
  incomeOf,
  plannedRows,
  sumAmount,
} from "./data.js";

const csvImporter: Importer = {
  id: "csv",
  label: "CSV",
  canHandle: ({ fileName }) => fileName.toLowerCase().endsWith(".csv"),
  parse: ({ fileName, text }) => parseCsvText(text, { name: fileName }),
};

/** Derivation: category by rules and month, shared with the app. */
const categoriseDerivation: Derivation = {
  id: "categorise",
  label: "Category by rules",
  derive: (table) => derive(table),
};

function metricsFor(table: Table, query: Query): Metric[] {
  const rows = actualRows(table);
  const income = incomeOf(rows);
  const expenses = expensesOf(rows);
  const planned = sumAmount(plannedRows(table));
  const balance = income - expenses;
  const variance = planned === 0 ? 0 : ((planned - expenses) / planned) * 100;
  return [
    { id: "balance", label: "Balance", value: balance, unit: "€", detail: null },
    { id: "income", label: "Came in", value: income, unit: "€", detail: null },
    { id: "expenses", label: "Went out", value: expenses, unit: "€", detail: null },
    { id: "plan", label: "Planned spending", value: planned, unit: "€", detail: null },
    { id: "variance", label: "Under plan", value: variance, unit: "%", detail: null },
  ];
}

const balanceReducer: Reducer = {
  id: "balance",
  label: "Balance",
  reduce: (table, query) => metricsFor(table, query),
};

const views: ViewSpec[] = [
  {
    id: "overview",
    label: "Overview",
    description: null,
    columns: ["date", "label", "category", "amount"],
    chart: { kind: "bubble", x: "category", y: "amount", series: null, title: "Where the money went" },
    filters: [],
  },
  {
    id: "transactions",
    label: "Transactions",
    description: null,
    columns: ["date", "label", "category", "amount"],
    chart: null,
    filters: [],
  },
  {
    id: "categories",
    label: "Categories",
    description: null,
    columns: ["category", "amount"],
    chart: { kind: "bar", x: "category", y: "amount", series: null, title: "Spending by category" },
    filters: [],
  },
  {
    id: "actual-vs-plan",
    label: "Actual vs plan",
    description: null,
    columns: ["category", "amount"],
    chart: { kind: "delta-bar", x: "category", y: "amount", series: null, title: "Actual vs plan" },
    filters: [],
  },
  {
    id: "rejected-rows",
    label: "Rejected rows",
    description: null,
    columns: [],
    chart: null,
    filters: [],
  },
];

const privateAdapter: ShareAdapter = {
  id: "private",
  label: "Private · encrypted",
  mode: "private",
  encode: (payload) => encodeLink(payload, "private"),
  decode: async (token) => (await decodeLink(token)).payload,
};

const publicAdapter: ShareAdapter = {
  id: "public",
  label: "Public · view only",
  mode: "public",
  encode: (payload) => encodeLink(payload, "public"),
  decode: async (token) => (await decodeLink(token)).payload,
};

export const explorerConfig: ExplorerConfig = {
  id: "nonprofit-budget",
  title: "Fern Street Budget",
  importers: [csvImporter],
  derivations: [categoriseDerivation],
  reducers: [balanceReducer],
  views,
  shareAdapters: [privateAdapter, publicAdapter],
  theme: {
    colors: {
      background: "#F4F3F0",
      surface: "#FFFFFF",
      soft: "#F4F3F0",
      "soft-2": "#EDEBE7",
      ink: "#141414",
      "ink-2": "rgba(20,20,20,.62)",
      "ink-3": "rgba(20,20,20,.42)",
      line: "rgba(20,20,20,.07)",
      "line-2": "rgba(20,20,20,.13)",
      accent: "#1E8A5A",
      good: "#1E8A5A",
      neutral: "#9C968B",
      bad: "#D4512A",
      "orb-activities": "radial-gradient(circle at 32% 28%, #FFE3C8 0, #F58A5A 38%, #E0573A 70%, #B8402E)",
      "orb-events": "radial-gradient(circle at 32% 28%, #F6DDFF 0, #B77BF0 40%, #7B4BD1 78%, #5A35A8)",
      "orb-premises": "radial-gradient(circle at 32% 28%, #D9EBFF 0, #7FA8F0 42%, #4D74D6 80%)",
      "orb-fixed-costs": "radial-gradient(circle at 32% 28%, #F3F1EC 0, #C9C4BA 45%, #9C968B 85%)",
      "orb-grants": "radial-gradient(circle at 32% 28%, #E1F7E9 0, #7FD3A6 42%, #2FA472 82%)",
      "orb-other": "radial-gradient(circle at 32% 28%, #FFF4C9 0, #F4D06A 42%, #D9A62A 85%)",
    },
    fonts: {
      sans: "Inter, system-ui, sans-serif",
      mono: "'Geist Mono', ui-monospace, monospace",
      serif: "'Instrument Serif', Georgia, serif",
    },
    radii: { card: "22px", pill: "999px" },
    spacing: { unit: "8px" },
  },
  i18n: { locale: "en", strings: {} },
};
