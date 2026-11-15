import type { ImportOutcome, Table, ViewSpec } from "@bare-bones/core";
import { createViewState, findImporter } from "@bare-bones/core";
import type { ShareMode } from "@bare-bones/core";
import type { ChartPoint, ShareCardProps } from "@bare-bones/ui";
import { Chart, EmptyState, ImportScreen, LinkScreen, ShareCard, VirtualGrid } from "@bare-bones/ui";
import { useIncomingLink, useImportWorker } from "@bare-bones/ui";
import { useEffect, useState } from "react";
import { actualRows, byCategory, derive, expensesOf, incomeOf, loadDemoBundle } from "./data.js";
import { explorerConfig } from "./explorer.config.js";
import "@bare-bones/ui/styles.css";
import "./orb.css";

const COLORS: Record<string, string> = {
  Activities: "var(--bb-color-orb-activities)", Events: "var(--bb-color-orb-events)",
  Premises: "var(--bb-color-orb-premises)", "Fixed costs": "var(--bb-color-orb-fixed-costs)",
  Grants: "var(--bb-color-orb-grants)", Membership: "var(--bb-color-orb-grants)", Other: "var(--bb-color-orb-other)",
};

function orbStyle(category: string): { background: string } {
  return { background: COLORS[category] ?? COLORS["Other"] ?? "var(--bb-color-orb-other)" };
}

function money(value: number): string {
  return `${value < 0 ? "−" : ""}€${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

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

function GhostSpheres(): React.ReactNode {
  const GHOSTS: readonly [string, string, string, number][] = [
    ["Activities", "58px", "48px", 150], ["Events", "212px", "34px", 96], ["Premises", "196px", "150px", 74],
    ["Grants", "300px", "128px", 52], ["Fixed costs", "118px", "210px", 44], ["Other", "286px", "206px", 34],
  ];
  return (
    <>
      {GHOSTS.map(([category, left, top, size]) => <i key={category} className="orb bb-ghost" style={{ ...orbStyle(category), left, top, width: size, height: size }} />)}
      <span className="bb-ghost-lab"><b>Your categories</b>become spheres, sized by spend</span>
    </>
  );
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
      {points.map((point, index) => (
        <div className="orb-bubble-wrap" key={point.label} style={{ left: `${(index % 3) * 31 + 2}%`, top: `${Math.floor(index / 3) * 52 + 3}%` }}>
          <i className="orb orb-bubble" style={{ ...orbStyle(point.label), width: 48 + Math.sqrt(point.value / max) * 88, height: 48 + Math.sqrt(point.value / max) * 88 }} />
          <span>{point.label}<small>{money(point.value)}</small></span>
        </div>
      ))}
    </div>
  );
}

function OrbNav({ views, activeId, onSelect, rejected }: { views: readonly ViewSpec[]; activeId: string; onSelect: (id: string) => void; rejected: number }) {
  return (
    <nav className="orb-nav">
      <div className="orb-brand"><i className="orb" style={orbStyle("Activities")} /><div><b>Fern Street</b><small>Residents' association</small></div></div>
      {views.filter((view) => view.id !== "rejected-rows").map((view) => <button key={view.id} className={activeId === view.id ? "on" : ""} type="button" onClick={() => onSelect(view.id)}>{view.label}</button>)}
      <button type="button" className={activeId === "rejected-rows" ? "on" : ""} onClick={() => onSelect("rejected-rows")}>Rejected rows{rejected === 0 ? null : <b>{rejected}</b>}</button>
      <span className="orb-nav-spacer" />
      <div className="orb-made"><b>Your data stays here</b>The file was read in this browser. Nothing was uploaded.</div>
    </nav>
  );
}

function OrbRail({ table, payload, defaultMode }: { table: Table; payload: ShareCardProps["payload"]; defaultMode: ShareMode }) {
  return (
    <div className="orb-rail">
      <ShareCard title="Share with members" payload={payload} defaultMode={defaultMode} passphrase />
      <section className="orb-card orb-rejected">
        <h3>Rejected rows <i>{table.rejected.length}</i></h3>
        {table.rejected.slice(0, 3).map((row) => <div className="orb-rejected-row" key={row.line}><code>{row.raw || ";;;"}</code><b>{row.reason === "invalid-date" ? "Date does not exist" : row.reason === "invalid-number" ? "Amount is not a number" : "Could not parse row"}</b></div>)}
      </section>
      <section className="orb-card orb-plan">
        <h3>Actual vs plan</h3>
        {byCategory(table).map((entry) => (
          <div className="orb-plan-row" key={entry.category}>
            <div><span>{entry.category}</span><b>{money(entry.actual)} / {money(entry.planned)}</b></div>
            <div className="orb-track"><i style={{ width: `${Math.min(100, entry.planned === 0 ? 0 : (entry.actual / entry.planned) * 100)}%`, background: COLORS[entry.category] }} /><u style={{ left: "89%" }} /></div>
          </div>
        ))}
      </section>
    </div>
  );
}

function OrbCell({ column, row }: { column: { id: string }; row: Record<string, unknown> }) {
  const value = row[column.id];
  if (column.id === "category") return <span className="orb-category"><i className="orb orb-dot" style={orbStyle(String(value))} />{String(value ?? "")}</span>;
  if (column.id === "amount" && typeof value === "number") return <span className={value < 0 ? "orb-negative" : "orb-positive"}>{money(value)}</span>;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

function App() {
  const [table, setTable] = useState<Table | null>(null);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [activeId, setActiveId] = useState("overview");
  const [viewState, setViewState] = useState(() => createViewState("fy2026", "overview"));
  const [shareMode] = useState<ShareMode>("private");
  const link = useIncomingLink();
  const importer = useImportWorker({
    createWorker: () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
    onComplete: setOutcome,
  });

  useEffect(() => {
    const data = link.payload?.data;
    if (link.status === "ready" && data !== null && data !== undefined) setTable(derive(data));
  }, [link.status, link.payload]);

  const loadDemo = (): void => { loadDemoBundle("./").then(setTable).catch(() => setOutcome(null)); };
  const onFile = (file: File): void => {
    if (findImporter(explorerConfig, file.name) === undefined) return;
    importer.start(file);
  };

  if (table === null && (link.status === "invalid" || link.status === "locked")) {
    return <LinkScreen status={link.status} token={link.token} error={link.error} backHref="../" onUnlock={link.unlock} onEmpty={link.dismiss} />;
  }
  if (outcome !== null || ["columns", "rows", "building", "error"].includes(importer.state.phase)) {
    return (
      <ImportScreen
        fileName={importer.state.fileName}
        fileSize={importer.state.fileSize}
        totalRows={importer.state.totalRows}
        header={importer.state.header}
        phase={importer.state.phase}
        error={importer.state.error}
        outcome={outcome}
        onCancel={() => { importer.cancel(); setOutcome(null); }}
        onOpen={() => { if (outcome !== null) { setTable(derive(outcome.table)); setOutcome(null); } }}
      />
    );
  }
  if (table === null) {
    return (
      <div className="orb-app">
        <div className="orb-screen">
          <div className="orb-bar">
            <a className="bb-screen-back" href="../">← Bare Bones</a>
            <span className="bb-screen-title">Fern Street<small>Neighbourhood association</small></span>
            <span className="bb-screen-spacer" />
            <span className="bb-cap">No data yet</span>
          </div>
          <EmptyState
            eyebrow="Step 1 of 1 · bring your ledger"
            title={<>Drop a spreadsheet, <b>see where the money <em>went.</em></b></>}
            description="Your CSV is read in this browser. Nothing is uploaded, there is no account, and you can share the result with one link."
            columns={[
              { label: "date", hint: "YYYY-MM-DD" }, { label: "label" }, { label: "category" },
              { label: "amount", hint: "−12.50" }, { label: "+ plan.csv, optional" },
            ]}
            note="Your data stays here. Close the tab and it is gone."
            zoneLabel="Drop a .csv file here"
            zoneHint="or paste from your spreadsheet · up to 50,000 rows"
            demoTitle="Just looking?"
            demoNote="A full sample year for a small association."
            demoLabel="Load demo data"
            art={<GhostSpheres />}
            onFile={onFile}
            onDemo={loadDemo}
          />
        </div>
      </div>
    );
  }

  const views = explorerConfig.views;
  const current = views.find((view) => view.id === activeId) ?? views[0];
  const payload = { version: 1 as const, state: { ...viewState, viewId: activeId }, data: table, meta: { title: explorerConfig.title } };

  return (
    <div className="orb-app">
      {link.blocked ? (
        <div className="orb-banner" role="status">
          This link was changed or cut short. Nothing was loaded or replaced.
          <button type="button" onClick={link.dismiss}>Dismiss</button>
        </div>
      ) : null}
      <div className="orb-app-inner">
        <a className="bb-screen-back orb-back-main" href="../">← Bare Bones</a>
        <div className="bb-page">
          <div className="bb-page-body">
            <aside className="bb-page-side">
              <OrbNav views={views} activeId={activeId} onSelect={(id) => { setActiveId(id); setViewState((s) => ({ ...s, viewId: id })); }} rejected={table.rejected.length} />
            </aside>
            <main className="bb-page-main">
              <div className="orb-topbar">
                <div className="orb-seg"><span>2025</span><span className="on">2026</span></div>
                <div className="orb-search">⌕&nbsp; Search transactions</div>
                <span className="orb-grow" />
                <label className="orb-import">Import CSV<input type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); }} /></label>
              </div>
              <div className="orb-hero">
                <Balance table={table} />
                {kpi("Came in", incomeOf(actualRows(table)), "Grants", "grants, dues and room hire", "+8%")}
                {kpi("Went out", expensesOf(actualRows(table)), "Activities", "below the plan", "−3.1%")}
              </div>
              <div className="orb-mid">
                <section className="orb-card orb-panel">
                  <div className="orb-panel-head"><h3>Where the money went</h3><span className="orb-cap">Size = amount</span></div>
                  <Bubbles table={table} />
                </section>
                <section className="orb-card orb-panel">
                  <div className="orb-panel-head"><h3>Monthly spending</h3><div className="orb-legend"><span><i />actual</span><span><i className="plan" />planned</span></div></div>
                  <Chart kind="bar" title="Monthly spending" points={monthlyPoints(table)} />
                </section>
              </div>
              <section className="orb-table-panel orb-card">
                <div className="orb-filter-chips"><span className="on">All</span><span>Activities</span><span>Events</span><span>Grants</span><button type="button" onClick={() => setViewState((s) => ({ ...s, query: { ...s.query, filters: [] } }))}>Clear filters</button></div>
                <VirtualGrid columns={table.columns.filter((c) => ["date", "label", "category", "amount"].includes(c.id))} rows={table.rows.filter((row) => row["entry"] !== "planned")} caption={current?.label} renderCell={(column, row) => <OrbCell column={column} row={row} />} />
              </section>
              {activeId === "rejected-rows" ? <Rejected table={table} /> : null}
            </main>
            <aside className="bb-page-rail"><OrbRail table={table} payload={payload} defaultMode={shareMode} /></aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rejected({ table }: { table: Table }) {
  return (
    <section className="orb-card orb-rejected-full">
      <h3>Rejected rows</h3>
      {table.rejected.map((row) => <p key={row.line}><b>Line {row.line}</b> {row.reason}: {row.detail ?? row.raw}</p>)}
    </section>
  );
}

export { App };
