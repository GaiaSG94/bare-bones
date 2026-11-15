#!/usr/bin/env node
/**
 * Line budgets (tools/budgets.json) and gzip budgets per site (200 kB,
 * 3D scene excluded and measured apart).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const budgets = JSON.parse(readFileSync(join(root, "tools/budgets.json"), "utf8"));
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".html", ".js", ".mjs"]);
const GZIP_LIMIT = 200 * 1024;
const SCENE_CHUNK = /^(three|engine|stadium)-/;

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "design") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (CODE_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

function countLines(files) {
  let total = 0;
  for (const file of files) {
    if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
    total += readFileSync(file, "utf8").split("\n").filter((line) => line.trim() !== "").length;
  }
  return total;
}

function gzipOf(distDir) {
  if (!existsSync(distDir)) return null;
  let main = 0;
  let scene = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(js|css|html)$/.test(entry)) continue;
      const size = gzipSync(readFileSync(full)).length;
      if (SCENE_CHUNK.test(entry)) scene += size;
      else main += size;
    }
  };
  walk(distDir);
  return { main, scene };
}

let failed = false;
for (const [scope, ceiling] of Object.entries(budgets)) {
  const dir = join(root, scope);
  if (!existsSync(dir)) {
    console.log(`${scope}: not built yet (skipped)`);
    continue;
  }
  const total = countLines(listFiles(dir));
  const status = total <= ceiling ? "OK" : "EXCEEDED";
  console.log(`${scope}: ${total}/${ceiling} ${status}`);
  if (total > ceiling) failed = true;
}

const sites = [
  ["home", join(root, "site/dist")],
  ["budget", join(root, "apps/nonprofit-budget/dist")],
  ["club", join(root, "apps/club-results/dist")],
  ["skeleton", join(root, "skeleton/dist")],
];
for (const [name, dist] of sites) {
  const size = gzipOf(dist);
  if (size === null) {
    console.log(`gzip ${name}: not built yet (skipped)`);
    continue;
  }
  const ok = size.main <= GZIP_LIMIT;
  console.log(
    `gzip ${name}: ${(size.main / 1024).toFixed(1)} kB / 200 kB ${ok ? "OK" : "EXCEEDED"}` +
      (size.scene > 0 ? ` (+ ${(size.scene / 1024).toFixed(1)} kB lazy 3D, measured apart)` : ""),
  );
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log("budgets: ok");
