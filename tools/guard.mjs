#!/usr/bin/env node
/**
 * "Public API only" guard. Apps and the skeleton must import the frozen
 * entry points of @bare-bones/core and @bare-bones/ui (the package root),
 * never internal module paths. Also rejects dangerouslySetInnerHTML and
 * unescaped HTML injection.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INTERNAL_IMPORT = /@bare-bones\/(core|ui)\/(?!$)/;
const DANGEROUS_HTML = /dangerouslySetInnerHTML/;

function listFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) out.push(full);
  }
  return out;
}

let failed = false;
for (const area of ["apps", "skeleton", "site"]) {
  for (const file of listFiles(join(root, area))) {
    const text = readFileSync(file, "utf8");
    const rel = relative(root, file);
    if (INTERNAL_IMPORT.test(text)) {
      console.error(`${rel}: imports an internal path of core/ui (public API only)`);
      failed = true;
    }
    if (DANGEROOUS_HTML.test(text)) {
      console.error(`${rel}: uses dangerouslySetInnerHTML (forbidden)`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("guards: ok");
