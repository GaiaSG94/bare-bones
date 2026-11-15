import type { Table } from "@bare-bones/core";
import { createViewState, decodeText, findImporter } from "@bare-bones/core";
import type { ShareMode } from "@bare-bones/core";
import type { ShareCardProps } from "@bare-bones/ui";
import { Chart, ShareCard } from "@bare-bones/ui";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { loadDemoSeason, nextFixture, standings, TEAMS } from "./data.js";
import type { Outcome, Standing } from "./data.js";
import { explorerConfig } from "./explorer.config.js";
import "./floodlight.css";

const TEAM = new Map<string, (typeof TEAMS)[number]>(TEAMS.map((team) => [team.name, team]));
const PILL: Record<Outcome, string> = { W: "fl-w", D: "fl-d", L: "fl-l" };
const FORM: Record<Outcome, "win" | "draw" | "loss"> = { W: "win", D: "draw", L: "loss" };
const RANK = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

function Crest({ name, big = false }: { name: string; big?: boolean }) {
  const team = TEAM.get(name) ?? { color: "#64748B", initials: "??" };
  return (
    <svg viewBox="0 0 42 48" className={big ? "fl-crest-big" : "fl-crest"}>
      <path d="M21 1 40 6v17c0 12-8 20-19 24C10 43 2 35 2 23V6z" fill={team.color} />
      <path d="M21 1 40 6v9H2V6z" fill="#fff" opacity=".2" />
      <path d="M4 30 21 18l17 12" fill="none" stroke="#05070C" strokeOpacity=".28" strokeWidth="3" />
      <text x="21" y="15" textAnchor="middle" fontWeight="800" fontSize="9" fill="#05070C" fillOpacity=".72">{team.initials}</text>
    </svg>
  );
}

function Shell({ fallback, canvasRef, children }: { fallback: boolean; canvasRef: RefObject<HTMLCanvasElement | null>; children: ReactNode }) {
  return (
    <div className="fl-app">
      <canvas ref={canvasRef} className="fl-canvas" hidden={fallback} />
      {fallback ? <div className="fl-bgimg" /> : null}
      <div className="fl-shade" /><div className="fl-grain" />
      <header className="fl-top">
        <a className="fl-back" href="../">← Bare Bones</a>
        <span className="fl-live"><i />Season 2026 · <b>Demo data</b></span>
      </header>
      {children}
    </div>
  );
}

function Empty({ fallback, canvasRef, onLoad, onFile }: { fallback: boolean; canvasRef: RefObject<HTMLCanvasElement | null>; onLoad: () => void; onFile: (file: File) => void }) {
  return (
    <Shell fallback={fallback} canvasRef={canvasRef}>
      <div className="fl-empty">
        <span className="fl-k">Under the floodlights</span>
        <h1 className="fl-title">No match <em>played yet.</em></h1>
        <p className="fl-pitch">Drop a results CSV and the league table lights up. Everything stays in this browser.</p>
        <div className="fl-empty-actions">
          <button type="button" className="fl-button" onClick={onLoad}>Load demo season</button>
          <label className="fl-file">Drop results.csv<input type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); }} /></label>
        </div>
      </div>
    </Shell>
  );
}

function LeagueTable({ rows, selected, onSelect, next }: { rows: readonly Standing[]; selected: string; onSelect: (team: string) => void; next: { home: string; away: string; date: string; week: number } | null }) {
  return (
    <section className="fl-card">
      <div className="fl-head"><span className="fl-k">Riverside Six</span><span className="fl-chip">Week {next !== null ? next.week - 1 : rows[0]?.played ?? 0}</span></div>
      <h2 className="fl-h2">League <span>table</span></h2>
      <div className="fl-lh"><span>#</span><span>Team</span><span>P</span><span>GD</span><span>PTS</span></div>
      <div className="fl-lt">
        {rows.map((row, index) => (
          <button type="button" key={row.team} className={`fl-r${index === 0 ? " fl-leader" : ""}${row.team === selected ? " fl-on" : ""}`} onClick={() => onSelect(row.team)}>
            <span className="fl-pos">{index + 1}</span>
            <span className="fl-team"><Crest name={row.team} />{row.team}</span>
            <span className="fl-g">{row.played}</span>
            <span className="fl-g">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</span>
            <span className="fl-pt">{row.points}</span>
          </button>
        ))}
      </div>
      {next === null ? null : (
        <div className="fl-next">
          <span className="fl-tm"><Crest name={next.home} />{next.home}</span>
          <span className="fl-vs"><span className="fl-k">{next.date}</span><b>vs</b><span className="fl-k">Kick-off 14:00</span></span>
          <span className="fl-tm"><Crest name={next.away} />{next.away}</span>
        </div>
      )}
    </section>
  );
}

function TeamPage({ standing }: { standing: Standing }) {
  const gd = standing.goalDifference > 0 ? `+${standing.goalDifference}` : String(standing.goalDifference);
  const curve = standing.cumulative.map((value, index) => ({ label: String(index + 1), value }));
  return (
    <section className="fl-card">
      <div className="fl-hero">
        <Crest name={standing.team} big />
        <div><span className="fl-k">{RANK[TEAMS.findIndex((t) => t.name === standing.team)]} · {standing.played} played</span><h2 className="fl-h2">{standing.team}</h2></div>
      </div>
      <div className="fl-pts"><b>{standing.points}</b><span className="fl-k">points<br />{gd} goal diff.</span></div>
      <div className="fl-stats">
        <div><b>{standing.won}</b><span>WON</span></div>
        <div><b>{standing.drawn}</b><span>DRAWN</span></div>
        <div><b>{standing.lost}</b><span>LOST</span></div>
        <div><b>{gd}</b><span>GD</span></div>
      </div>
      <div className="fl-form">
        <span className="fl-k">Form streak · last 5</span>
        <Chart kind="form" title="Form" points={[]} results={standing.form.map((o) => FORM[o])} width={260} height={44} />
        <Chart kind="line" title="Cumulative points" points={curve} width={260} height={70} />
      </div>
      <div className="fl-results">
        {standing.results.slice(-3).reverse().map((result) => (
          <div key={`${result.opponent}-${result.score}`}>
            <span>{result.venue === "home" ? "vs" : "at"} {result.opponent}</span>
            <b>{result.score}</b>
            <i className={PILL[result.outcome]}>{result.outcome}</i>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShareColumn({ payload }: { payload: ShareCardProps["payload"] }) {
  return (
    <section className="fl-card">
      <div className="fl-head"><span className="fl-k">Team talk</span><span className="fl-chip">18 members</span></div>
      <h2 className="fl-h2">Shared <span>by link</span></h2>
      <p className="fl-pitch">The coach posts the same link every week. It opens this exact view — no account, no app install.</p>
      <ShareCard title="League table" payload={payload} defaultMode={"public" as ShareMode} />
      <p className="fl-note">The link only holds the compressed view state. Nothing is uploaded anywhere.</p>
    </section>
  );
}

function App() {
  const [table, setTable] = useState<Table | null>(null);
  const [selected, setSelected] = useState<string>(TEAMS[0].name);
  const [fallback, setFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (canvas.getContext("webgl2") === null && canvas.getContext("webgl") === null) {
      setFallback(true);
      return;
    }
    let cancelled = false;
    let dispose = (): void => {};
    import("./stadium.js").then((module) => {
      if (!cancelled) dispose = module.startStadium(canvas);
    }).catch(() => setFallback(true));
    return () => { cancelled = true; dispose(); };
  }, []);

  const load = (): void => { loadDemoSeason("./").then(setTable).catch(() => setFallback(true)); };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("demo")) load();
  }, []);
  const importFile = async (file: File): Promise<void> => {
    const decoded = decodeText(new Uint8Array(await file.arrayBuffer()));
    const importer = findImporter(explorerConfig, file.name);
    if (importer === undefined) return;
    setTable(importer.parse({ fileName: file.name, text: decoded.text }).table);
  };

  if (table === null) return <Empty fallback={fallback} canvasRef={canvasRef} onLoad={load} onFile={(file) => void importFile(file)} />;

  const rows = standings(table);
  const standing = rows.find((row) => row.team === selected) ?? rows[0];
  const payload = { version: 1 as const, state: createViewState("season-2026", "league-table"), data: table, meta: { title: explorerConfig.title } };

  return (
    <Shell fallback={fallback} canvasRef={canvasRef}>
      <main className="fl-cols">
        <LeagueTable rows={rows} selected={selected} onSelect={setSelected} next={nextFixture(table)} />
        {standing === undefined ? null : <TeamPage standing={standing} />}
        <ShareColumn payload={payload} />
      </main>
    </Shell>
  );
}

export { App };
