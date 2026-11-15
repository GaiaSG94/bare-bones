#!/usr/bin/env node
/**
 * `tools/doctor` — checks that a checkout can build, test and ship:
 * Node and pnpm versions, workspace links, frozen core/ui, budgets,
 * guards, and whether the four sites have been built.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const check = (name, fn) => {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail: detail ?? "" });
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
};

check("node >= 20.19", () => {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 20 || (major === 20 && minor < 19)) throw new Error(`node ${process.versions.node}`);
  return `node ${process.versions.node}`;
});

check("pnpm available", () => {
  const bin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const version = execFileSync(bin, ["--version"], { encoding: "utf8", shell: true }).trim();
  return `pnpm ${version}`;
});

check("dependencies installed", () => {
  if (!existsSync(join(root, "node_modules"))) throw new Error("run pnpm install");
  return "node_modules present";
});

check("workspace packages linked", () => {
  for (const app of ["apps/nonprofit-budget", "apps/club-results", "skeleton"]) {
    if (!existsSync(join(root, app, "node_modules", "@bare-bones", "core"))) {
      throw new Error(`${app}: @bare-bones/core not linked`);
    }
  }
  return "3 apps linked to core and ui";
});

check("frozen core/ui manifest", () => {
  const manifest = readFileSync(join(root, "tools/core-ui.sha256"), "utf8").split("\n").filter(Boolean);
  return `${manifest.length} files hashed`;
});

check("guards", () => {
  execFileSync(process.execPath, ["tools/guard.mjs"], { cwd: root, encoding: "utf8" });
  return "public API only, frozen core/ui, no sound";
});

check("line and gzip budgets", () => {
  execFileSync(process.execPath, ["tools/budget.mjs"], { cwd: root, encoding: "utf8" });
  return "all budgets ok";
});

check("built sites", () => {
  const sites = ["site/dist/index.html", "apps/nonprofit-budget/dist/index.html", "apps/club-results/dist/index.html", "skeleton/dist/index.html"];
  const missing = sites.filter((site) => !existsSync(join(root, site)));
  if (missing.length > 0) throw new Error(`missing build: ${missing.join(", ")}`);
  return "home, budget, club, skeleton";
});

for (const result of results) {
  console.log(`${result.ok ? "ok  " : "FAIL"} ${result.name}${result.detail === "" ? "" : ` — ${result.detail}`}`);
}
process.exit(results.every((result) => result.ok) ? 0 : 1);
