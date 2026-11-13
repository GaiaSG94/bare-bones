import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import type { ExplorerConfig, Table } from "@bare-bones/core";
import { Explorer } from "./Explorer.js";

const table: Table = {
  id: "budget",
  name: "Budget",
  columns: [
    { id: "category", label: "Category", type: "category", format: { kind: "category", levels: ["Grants"] } },
    { id: "amount", label: "Amount", type: "number", format: { kind: "number", decimals: 2, locale: "fr" } },
  ],
  rows: [
    { category: "Grants", amount: 1200 },
    { category: "Grants", amount: 300 },
  ],
  rejected: [{ line: 4, raw: "bad row", reason: "invalid-number", detail: "Amount: bad" }],
};

const config: ExplorerConfig = {
  id: "budget",
  title: "Fern Street Budget",
  importers: [
    {
      id: "csv",
      label: "CSV",
      canHandle: () => true,
      parse: () => ({ table, warnings: [] }),
    },
  ],
  derivations: [],
  reducers: [
    {
      id: "total",
      label: "Total",
      reduce: (source) => [
        {
          id: "total",
          label: "Total",
          value: source.rows.length,
          unit: "rows",
          detail: null,
        },
      ],
    },
  ],
  views: [
    {
      id: "overview",
      label: "Overview",
      description: null,
      columns: ["category", "amount"],
      chart: {
        kind: "bar",
        x: "category",
        y: "amount",
        series: null,
        title: "Where the money went",
      },
      filters: [],
    },
  ],
  shareAdapters: [],
  theme: {
    colors: { background: "#f4f3f0" },
    fonts: { sans: "Inter, sans-serif" },
    radii: { card: "22px" },
    spacing: { unit: "8px" },
  },
  i18n: { locale: "en", strings: {} },
};

describe("Explorer", () => {
  it("shows the drop zone before any data", () => {
    const html = renderToString(<Explorer config={config} />);
    expect(html).toContain("Drop a CSV file here");
    expect(html).toContain("Fern Street Budget");
  });

  it("renders views, metrics, charts and the share panel once data is loaded", () => {
    const html = renderToString(
      <Explorer config={config} demoDataUrl="/demo.csv" initialTable={table} />,
    );
    expect(html).toContain("Overview");
    expect(html).toContain("Where the money went");
    expect(html).toContain("Share");
    expect(html).toContain("Export CSV");
    expect(html).toContain("Rejected rows");
  });
});
