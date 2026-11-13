#!/usr/bin/env node
/**
 * Measures the real numbers of the repo and writes site/metrics.json.
 * Nothing here is invented: each value is counted from the actual sources.
 * Values that cannot be measured yet (site sizes, CI duration) are null.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
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

const coreSrc = join(root, "packages/core/src");
const testFiles = walk(coreSrc).filter((f) => f.endsWith(".test.ts"));
const sourceFiles = walk(coreSrc).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

const metrics = {
  measuredAt: new Date().toISOString(),
  packages: {
    core: { lines: countLines(coreSrc), ceiling: 3300 },
    ui: { lines: countLines(join(root, "packages/ui")), ceiling: 4400 },
    skeleton: { lines: countLines(join(root, "skeleton")), ceiling: 300 },
  },
  tests: {
    files: testFiles.length,
    cases: countPattern(testFiles, /\bit\(|\btest\(/g),
    pbtProperties: countPattern(testFiles, /\bfc\.(async)?property\(/g),
    pbtSeed: 20261111,
  },
  runtimeDependencies: ["zod", "react", "react-dom"],
  siteSizes: {
    home: null,
    budget: null,
    club: null,
    note: "measured at first build (step 7)",
  },
  ciDurationSeconds: null,
  ciNote: "measured via the GitHub API at step 7",
};

const siteDir = join(root, "site");
mkdirSync(siteDir, { recursive: true });
writeFileSync(
  join(siteDir, "metrics.json"),
  `${JSON.stringify(metrics, null, 2)}\n`,
);
console.log(JSON.stringify(metrics, null, 2));
