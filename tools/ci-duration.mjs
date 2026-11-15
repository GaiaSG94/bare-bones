#!/usr/bin/env node
/** Reads the last successful CI run duration from the GitHub API (public). */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "site/metrics.json");
const metrics = JSON.parse(readFileSync(path, "utf8"));

try {
  const url = "https://api.github.com/repos/GaiaSG94/bare-bones/actions/runs?per_page=10&status=success";
  const response = await fetch(url, { headers: { "User-Agent": "bare-bones-metrics" } });
  const data = await response.json();
  const run = (data.workflow_runs ?? []).find((r) => r.name === "ci");
  if (run) {
    metrics.ciDurationSeconds = Math.round((new Date(run.updated_at) - new Date(run.run_started_at)) / 1000);
    writeFileSync(path, `${JSON.stringify(metrics, null, 2)}\n`);
  }
} catch {
  /* offline: the value stays null */
}
console.log("ciDurationSeconds:", metrics.ciDurationSeconds);
