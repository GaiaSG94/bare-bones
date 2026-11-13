#!/usr/bin/env node
/**
 * Line-budget guard. Counts non-test source lines per scope and compares
 * them to tools/budgets.json. Fails (exit 1) when a budget is exceeded.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const budgets = JSON.parse(readFileSync(join(root, "tools/budgets.json"), "utf8"));
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".html", ".js", ".mjs"]);

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "design") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full));
    } else if (CODE_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function countLines(files) {
  let total = 0;
  for (const file of files) {
    if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    const code = lines.filter((line) => line.trim() !== "").length;
    total += code;
    console.log(`  ${relative(root, file)}: ${code}`);
  }
  return total;
}

let failed = false;
for (const [scope, ceiling] of Object.entries(budgets)) {
  const dir = join(root, scope);
  if (!existsSync(dir)) {
    console.log(`${scope}: not built yet (skipped)`);
    continue;
  }
  console.log(`${scope}:`);
  const total = countLines(listFiles(dir));
  const status = total <= ceiling ? "OK" : "EXCEEDED";
  console.log(`${scope}: ${total}/${ceiling} ${status}`);
  if (total > ceiling) failed = true;
}

if (failed) process.exit(1);
console.log("budgets: ok");
