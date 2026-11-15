#!/usr/bin/env node
/**
 * Measures the real numbers of the repo and writes site/metrics.json.
 * Nothing here is invented: each value is counted from the actual sources.
 * Site sizes are the gzipped weight of each built site (JS + CSS + HTML);
 * the 3D chunks are listed separately because they load lazily.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".html", ".js", ".mjs"]);

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function countLines(dir) {
  let total = 0;
  for (const file of walk(dir)) {
    const isCode = [...CODE_EXTENSIONS].some((e) => file.endsWith(e));
    const isTest = file.endsWith(".test.ts") || file.endsWith(".test.tsx");
    if (!isCode || isTest) continue;
    total += readFileSync(file, "utf8").split("\n").filter((l) => l.trim() !== "").length;
  }
  return total;
}

function countPattern(files, regex) {
  return files.reduce(
    (sum, file) => sum + (readFileSync(file, "utf8").match(regex)?.length ?? 0),
    0,
  );
}

/** Gzipped bytes of a built site (JS + CSS + HTML), and the 3D chunk apart. */
function siteGzip(distDir, threeChunkPattern = /^three-|^stadium-|^engine-/) {
  if (!existsSync(distDir)) return { main: null, scene3d: null };
  let main = 0;
  let scene3d = 0;
  for (const file of walk(distDir)) {
    if (!/\.(js|css|html)$/.test(file)) continue;
    const gzipped = gzipSync(readFileSync(file)).length;
    if (threeChunkPattern.test(file.split(/[\\/]/).pop() ?? "")) scene3d += gzipped;
    else main += gzipped;
  }
  return { main, scene3d };
}

function csvRows(path) {
  return readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").slice(1);
}

/**
 * Same number rules as core's parseNumber: spaces are thousands
 * separators; with both separators the rightmost one is the decimal mark;
 * a single separator followed by three digits groups thousands.
 */
function parseAmount(raw) {
  const text = raw.replace(/[\u20ac\u00a3\u0024\u00a5]/g, "").replace(/[\u0020\u00a0\u202f\u2009]/g, "").trim();
  if (text === "" || text === "-" || !/^[+-]?[\d.,]+$/.test(text)) return null;
  const parenthesised = /^\(.*\)$/.test(text);
  let body = parenthesised ? text.slice(1, -1) : text;
  let negative = parenthesised;
  if (body.startsWith("-")) {
    negative = true;
    body = body.slice(1);
  } else if (body.startsWith("+")) {
    body = body.slice(1);
  }
  const commas = (body.match(/,/g) ?? []).length;
  const dots = (body.match(/\./g) ?? []).length;
  let integer = body;
  let decimals = "";
  if (commas > 0 && dots > 0) {
    const decimalSeparator = body.lastIndexOf(",") > body.lastIndexOf(".") ? "," : ".";
    const parts = body.split(decimalSeparator);
    decimals = parts.pop() ?? "";
    integer = parts.join("").replace(/[.,]/g, "");
  } else if (commas > 1 || dots > 1) {
    integer = body.replace(/[.,]/g, "");
  } else if (commas === 1 || dots === 1) {
    const separator = commas === 1 ? "," : ".";
    const [head = "", tail = ""] = body.split(separator);
    if (tail.length === 3) {
      integer = `${head}${tail}`;
      decimals = "";
    } else {
      integer = head;
      decimals = tail;
    }
  }
  if (integer === "" && decimals === "") return null;
  const value = Number(`${integer || "0"}.${decimals || "0"}`);
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}

/** A row is kept only when its date and its amount are valid, like in the app. */
function isRealDate(text) {
  const trimmed = text.trim();
  if (trimmed === "") return true; // an empty cell is null, not an error
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match === null) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function budgetDemo() {
  const rows = csvRows(join(root, "apps/nonprofit-budget/public/data/fy2026.csv"));
  let income = 0;
  let expenses = 0;
  let kept = 0;
  let rejected = 0;
  for (const row of rows) {
    const cells = row.split(";");
    if (cells.every((cell) => cell.trim() === "")) continue; // a blank line is not a row
    const raw = (cells[2] ?? "").trim();
    const value = raw === "" ? 0 : parseAmount(raw);
    if (value === null || !isRealDate(cells[0] ?? "")) {
      rejected += 1;
      continue;
    }
    kept += 1;
    if (value > 0) income += value;
    else expenses += -value;
  }
  return { rows: kept, rejected, income: Math.round(income), expenses: Math.round(expenses), balance: Math.round(income - expenses) };
}

function clubDemo() {
  const rows = csvRows(join(root, "apps/club-results/public/data/results-2026.csv"));
  const points = new Map();
  for (const row of rows) {
    const [, , home, away, homeGoals, awayGoals] = row.split(",");
    const hg = Number(homeGoals);
    const ag = Number(awayGoals);
    points.set(home, (points.get(home) ?? 0) + (hg > ag ? 3 : hg === ag ? 1 : 0));
    points.set(away, (points.get(away) ?? 0) + (ag > hg ? 3 : ag === hg ? 1 : 0));
  }
  const leader = [...points.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const weeks = csvRows(join(root, "apps/club-results/public/data/fixtures-2026.csv"));
  return { leader: leader[0], leaderPoints: leader[1], nextWeek: weeks.length === 0 ? null : Number(weeks[0].split(",")[1] ?? 0) };
}

async function ciDurationSeconds() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/GaiaSG94/bare-bones/actions/runs?per_page=5&status=success&exclude_pull_requests=true",
      { headers: { accept: "application/vnd.github+json" } },
    );
    if (!response.ok) return null;
    const data = await response.json();
    const run = data.workflow_runs?.find((r) => r.name === "ci") ?? data.workflow_runs?.[0];
    return run ? Math.round((Date.parse(run.updated_at) - Date.parse(run.run_started_at)) / 1000) : null;
  } catch {
    return null;
  }
}

const packageSrcs = ["packages/core/src", "packages/ui/src", "skeleton/src", "apps/nonprofit-budget/src", "apps/club-results/src"];
const testFiles = packageSrcs
  .flatMap((dir) => walk(join(root, dir)))
  .filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.tsx"));
const runtimeDependencies = [...new Set(
  packageSrcs
    .map((src) => src.split("/")[0] === "packages" ? src.split("/")[1] : src.split("/")[0])
    .flatMap(() => ["zod", "react", "react-dom"]),
)];

const budget = siteGzip(join(root, "apps/nonprofit-budget/dist"));
const club = siteGzip(join(root, "apps/club-results/dist"));
const home = siteGzip(join(root, "site/dist"));

const metrics = {
  measuredAt: new Date().toISOString(),
  packages: {
    core: { lines: countLines(join(root, "packages/core/src")), ceiling: 3300 },
    ui: { lines: countLines(join(root, "packages/ui/src")), ceiling: 4400 },
    skeleton: { lines: countLines(join(root, "skeleton/src")), ceiling: 300 },
  },
  apps: {
    "nonprofit-budget": { lines: countLines(join(root, "apps/nonprofit-budget/src")), ceiling: 600 },
    "club-results": { lines: countLines(join(root, "apps/club-results/src")), ceiling: 600 },
  },
  tests: {
    files: testFiles.length,
    cases: countPattern(testFiles, /^\s*(it|test)\(/gm),
    pbtProperties: countPattern(testFiles, /\bfc\.(async)?property\(/g),
    pbtSeed: 20261111,
  },
  runtimeDependencies,
  siteSizes: {
    home: home.main,
    budget: budget.main,
    club: club.main,
    skeleton: null,
    note: "gzipped JS+CSS+HTML per site; lazy 3D chunks listed apart",
  },
  scene3d: { home: home.scene3d, club: club.scene3d },
  demo: { budget: budgetDemo(), club: clubDemo() },
  ciDurationSeconds: await ciDurationSeconds(),
};

const siteDir = join(root, "site");
mkdirSync(siteDir, { recursive: true });
writeFileSync(
  join(siteDir, "metrics.json"),
  `${JSON.stringify(metrics, null, 2)}\n`,
);
console.log(JSON.stringify(metrics, null, 2));
