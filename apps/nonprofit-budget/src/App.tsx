import type { Metric, Table, ViewSpec } from "@bare-bones/core";
import { aggregate } from "@bare-bones/core";
import { formatNumber } from "@bare-bones/ui";
import { BubbleChart, Chart, DeltaBarChart, LineChart, ShareCard, VirtualGrid } from "@bare-bones/ui";
import type { ChartPoint } from "@bare-bones/ui";
import { PageShell, Sidebar } from "@bare-bones/ui";
import { useMemo, useState } from "react";
import type { ExplorerConfig, ShareMode } from "@bare-bones/core";
import { createViewState, decodeLink, decodeText, findImporter, selectRows } from "@bare-bones/core";
import { actualRows, byCategory, derive, loadDemoBundle, parseCsv } from "./data.js";
import { explorerConfig } from "./explorer.config.js";
import "@bare-bones/ui/styles.css";
import "./orb.css";

const COLORS: Record<string, string> = {
  Activities: "var(--bb-color-orb-activities)",
  Events: "var(--bb-color-orb-events)",
  Premises: "var(--bb-color-orb-premises)",
  "Fixed costs": "var(--bb-color-orb-fixed-costs)",
  Grants: "var(--bb-color-orb-grants)",
  Membership: "var(--bb-color-orb-grants)",
  Other: "var(--bb-color-orb-other)",
};

function categoryPoints(table: Table): ChartPoint[] {
  const groups = new Map<string, number>();
  for (const row of actualRows(table)) {
    const amount = Number(row["amount"] ?? 0);
    if (amount >= 0) continue;
    const category = String(row["category"] ?? "Other");
    groups.set(category, (groups.get(category) ?? 0) + Math.abs(amount));
  }
  return [...groups.entries()].map(([label, value]) => ({ label, value }));
}

function monthlyPoints(table: Table): ChartPoint[] {
  const groups = new Map<string, number>();
  for (const row of actualRows(table)) {
    const amount = Number(row["amount"] ?? 0);
    if (amount >= 0) continue;
    const month = String(row["month"] ?? "");
    groups.set(month, (groups.get(month) ?? 0) + Math.abs(amount));
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label: label.slice(5), value }));
}

function money(value: number): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}€${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function orbStyle(category: string): { background: string } {
  return { background: COLORS[category] ?? COLORS["Other"] ?? "var(--bb-color-orb-other)" };
}

function kpi(label: string, value: number, category: string, detail: string, badge?: string) {
  return (
    <div className="orb-kpi">
      <div className="orb-kpi-head"><i className="orb orb-dot" style={orbStyle(category)} /><span className="orb-cap">{label}</span></div>
      <b>{money(value)}</b>
      <div className="orb-kpi-sub">{badge === undefined ? null : <i className={badge.startsWith("+") ? "up" : "dn"}>{badge}</i>}{detail}</div>
    </div>
  );
}

function Balance({ table }: { table: Table }) {
  const rows = actualRows(table);
  const income = rows.reduce((sum, row) => sum + Math.max(0, Number(row["amount"] ?? 0)), 0);
  const spending = rows.reduce((sum, row) => sum + Math.max(0, -Number(row["amount"] ?? 0)), 0);
  return (
    <div className="orb-balance orb-card">
      <div className="orb-balance-orb orb" />
      <span className="orb-cap">Balance · financial year 2026</span>
      <h2>{money(income - spending)}<small>left</small></h2>
      <p>Spending is <em>{spending === 0 ? "on" : "under"} the plan</em> built from the association's budget.</p>
    </div>
  );
}

function Bubbles({ table }: { table: Table }) {
  const points = categoryPoints(table).sort((a, b) => b.value - a.value).slice(0, 6);
  const max = points[0]?.value ?? 1;
  return (
    <div className="orb-bubbles">
      {points.map((point, index) => {
        const size = 48 + Math.sqrt(point.value / max) * 88;
        return (
          <div className="orb-bubble-wrap" key={point.label} style={{ left: `${(index % 3) * 31 + 2}%`, top: `${Math.floor(index / 3) * 52 + 3}%` }}>
            <i className="orb orb-bubble" style={{ ...orbStyle(point.label), width: size, height: size }} />
            <span>{point.label}<small>{money(point.value)}</small></span>
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const [table, setTable] = useState<Table | null>(null);
  const [activeId, setActiveId] = useState("overview");
  const [state, setState] = useState(() => createViewState("fy2026", "overview"));
  const [shareMode] = useState<ShareMode>("private");

  const load = async () => setTable(await loadDemoBundle("./"));
  const importFile = async (file: File) => {
    const decoded = decodeText(new Uint8Array(await file.arrayBuffer()));
    const importer = findImporter(explorerConfig, file.name);
    if (importer === undefined) return;
    setTable(derive(importer.parse({ fileName: file.name, text: decoded.text }).table));
  };

  const views = explorerConfig.views;
  const current = views.find((view) => view.id === activeId) ?? views[0];
  const points = table === null ? [] : categoryPoints(table);
  const monthly = table === null ? [] : monthlyPoints(table);
  const txRows = table === null ? [] : selectRows(table, state.query).filter((row) => row["entry"] !== "planned");
  const sharePayload = table === null ? null : { version: 1 as const, state: { ...state, viewId: activeId }, data: table, meta: { title: explorerConfig.title } };

  if (table === null) {
    return <OrbEmpty onLoad={load} onFile={importFile} />;
  }

  return (
    <div className="orb-app">
      <PageShell
        title="Fern Street Budget"
        backHref="../"
        sidebar={<OrbNav views={views} activeId={activeId} onSelect={(id) => { setActiveId(id); setState((s) => ({ ...s, viewId: id })); }} rejected={table.rejected.length} />}
        side={sharePayload === null ? null : <OrbRail table={table} payload={sharePayload} defaultMode={shareMode} />}
      >
        <div className="orb-topbar"><div className="orb-seg"><span>2025</span><span className="on">2026</span></div><div className="orb-search">⌕&nbsp; Search transactions</div><span className="orb-grow" /><label className="orb-import">Import CSV<input type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) void importFile(file); }} /></label></div>
        <div className="orb-hero"><Balance table={table} />{kpi("Came in", income(table), "Grants", "grants, dues and room hire", "+8%")}{kpi("Went out", expenses(table), "Activities", "below the plan", "−3.1%")}</div>
        <div className="orb-mid"><section className="orb-card orb-panel"><div className="orb-panel-head"><h3>Where the money went</h3><span className="orb-cap">Size = amount</span></div><Bubbles table={table} /></section><section className="orb-card orb-panel"><div className="orb-panel-head"><h3>Monthly spending</h3><div className="orb-legend"><span><i />actual</span><span><i className="plan" />planned</span></div></div><Chart kind="bar" title="Monthly spending" points={monthly} /></section></div>
        <section className="orb-table-panel orb-card"><div className="orb-filter-chips"><span className="on">All</span><span>Activities</span><span>Events</span><span>Grants</span><button type="button" onClick={() => setState((s) => ({ ...s, query: { ...s.query, filters: [] } }))}>Clear filters</button></div><VirtualGrid columns={table.columns.filter((c) => ["date", "label", "category", "amount"].includes(c.id))} rows={txRows} caption={current?.label} renderCell={(column, row) => <OrbCell column={column} row={row} />} /></section>
        {activeId === "rejected-rows" ? <Rejected table={table} /> : null}
      </PageShell>
    </div>
  );
}

function income(table: Table): number { return actualRows(table).reduce((sum, row) => sum + Math.max(0, Number(row["amount"] ?? 0)), 0); }
function expenses(table: Table): number { return actualRows(table).reduce((sum, row) => sum + Math.max(0, -Number(row["amount"] ?? 0)), 0); }

function OrbEmpty({ onLoad, onFile }: { onLoad: () => void; onFile: (file: File) => void }) {
  return <div className="orb-app"><PageShell title="Fern Street Budget" backHref="../"><div className="orb-empty orb-card"><div className="orb-empty-orb orb" /><span className="orb-cap">Orb · Fern Street Residents' Association</span><h2>See where the money <em>moves.</em></h2><p>Load an association statement and turn it into a calm, shareable view.</p><button type="button" className="orb-dark-button" onClick={onLoad}>Load demo data</button><label className="orb-file-button">Drop or choose CSV<input type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); }} /></label></div></PageShell></div>;
}

function OrbNav({ views, activeId, onSelect, rejected }: { views: readonly ViewSpec[]; activeId: string; onSelect: (id: string) => void; rejected: number }) {
  return <nav className="orb-nav"><div className="orb-brand"><i className="orb" style={orbStyle("Activities")} /><div><b>Fern Street</b><small>Residents' association</small></div></div>{views.filter((view) => view.id !== "rejected-rows").map((view) => <button key={view.id} className={activeId === view.id ? "on" : ""} type="button" onClick={() => onSelect(view.id)}>{view.label}</button>)}<button type="button" className={activeId === "rejected-rows" ? "on" : ""} onClick={() => onSelect("rejected-rows")}>Rejected rows{rejected === 0 ? null : <b>{rejected}</b>}</button><span className="orb-nav-spacer" /><div className="orb-made"><b>Your data stays here</b>The file was read in this browser. Nothing was uploaded.</div></nav>;
}

function OrbRail({ table, payload, defaultMode }: { table: Table; payload: NonNullable<Parameters<typeof ShareCard>[0]>["payload"]; defaultMode: ShareMode }) {
  const totals = byCategory(table);
  return <div className="orb-rail"><ShareCard title="Share with members" payload={payload} defaultMode={defaultMode} /><section className="orb-card orb-rejected"><h3>Rejected rows <i>{table.rejected.length}</i></h3>{table.rejected.slice(0, 3).map((row) => <div className="orb-rejected-row" key={row.line}><code>{row.raw || ";;;"}</code><b>{row.reason === "invalid-date" ? "Date does not exist" : row.reason === "empty-line" ? "Empty row, skipped" : "Could not parse row"}</b></div>)}</section><section className="orb-card orb-plan"><h3>Actual vs plan</h3>{totals.map((entry) => <div className="orb-plan-row" key={entry.category}><div><span>{entry.category}</span><b>{money(entry.actual)} / {money(entry.planned)}</b></div><div className="orb-track"><i style={{ width: `${Math.min(100, entry.planned === 0 ? 0 : (entry.actual / entry.planned) * 100)}%`, background: COLORS[entry.category] }} /><u style={{ left: "89%" }} /></div></div>)}</section></div>;
}

function OrbCell({ column, row }: { column: { id: string }; row: Record<string, unknown> }) {
  const value = row[column.id];
  if (column.id === "category") return <span className="orb-category"><i className="orb orb-dot" style={orbStyle(String(value))} />{String(value ?? "")}</span>;
  if (column.id === "amount" && typeof value === "number") return <span className={value < 0 ? "orb-negative" : "orb-positive"}>{money(value)}</span>;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

function Rejected({ table }: { table: Table }) { return <section className="orb-card orb-rejected-full"><h3>Rejected rows</h3>{table.rejected.map((row) => <p key={row.line}><b>Line {row.line}</b> {row.reason}: {row.detail ?? row.raw}</p>)}</section>; }

export { App };
