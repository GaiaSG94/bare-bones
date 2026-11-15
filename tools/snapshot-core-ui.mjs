#!/usr/bin/env node
/** Writes tools/core-ui.sha256: the frozen manifest of core and ui sources. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const lines = [...walk(join(root, "packages/core/src")), ...walk(join(root, "packages/ui/src"))]
  .map((file) => `${relative(root, file).replace(/\\/g, "/")} ${createHash("sha256").update(readFileSync(file)).digest("hex")}`)
  .sort();

writeFileSync(join(root, "tools/core-ui.sha256"), `${lines.join("\n")}\n`);
console.log(`snapshot written: ${lines.length} files`);
