#!/usr/bin/env node
/**
 * Blocking guards:
 *  1. "public API only": apps, the skeleton and the site import the frozen
 *     entry points of @bare-bones/core and @bare-bones/ui, never internals.
 *  2. No unescaped HTML injection (dangerouslySetInnerHTML is banned).
 *  3. "no-sound": no audio playback anywhere in the shipped code.
 *  4. core/ui are frozen: their file hashes must match tools/core-ui.sha256,
 *     proving the apps never needed to change them.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INTERNAL_IMPORT = /@bare-bones\/(core|ui)\/(?!styles\.css|worker)/;
const DANGEROUS_HTML = /dangerouslySetInnerHTML/;
const SOUND = /new Audio\(|<audio[\s>]|\.play\(\)\s*;|AudioContext\(/;

function listFiles(dir, extensions = /\.(ts|tsx|js|jsx|mjs)$/) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "public") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, extensions));
    else if (extensions.test(entry)) out.push(full);
  }
  return out;
}

function checkSources() {
  const problems = [];
  for (const area of ["apps", "skeleton", "site", "create-bare-bones", "power"]) {
    for (const file of listFiles(join(root, area))) {
      const text = readFileSync(file, "utf8");
      const rel = relative(root, file);
      if (INTERNAL_IMPORT.test(text)) problems.push(`${rel}: imports an internal path of core/ui (public API only)`);
      if (DANGEROUS_HTML.test(text)) problems.push(`${rel}: uses dangerouslySetInnerHTML (forbidden)`);
      if (SOUND.test(text)) problems.push(`${rel}: plays sound (the skeleton is silent)`);
    }
  }
  return problems;
}

function hashes(dir) {
  const entries = [];
  for (const file of listFiles(join(root, dir), /\.(ts|tsx|css)$/)) {
    entries.push(`${relative(root, file).replace(/\\/g, "/")} ${createHash("sha256").update(readFileSync(file)).digest("hex")}`);
  }
  return entries.sort();
}

function checkFrozen() {
  const manifestPath = join(root, "tools/core-ui.sha256");
  if (!existsSync(manifestPath)) return ["tools/core-ui.sha256 is missing: run node tools/snapshot-core-ui.mjs"];
  const expected = readFileSync(manifestPath, "utf8").split("\n").filter((line) => line.trim() !== "");
  const actual = [...hashes("packages/core/src"), ...hashes("packages/ui/src")];
  const problems = [];
  const expectedMap = new Map(expected.map((line) => [line.split(" ")[0], line.split(" ")[1]]));
  for (const line of actual) {
    const [file, hash] = line.split(" ");
    if (!expectedMap.has(file)) problems.push(`${file}: new file in core/ui (frozen)`);
    else if (expectedMap.get(file) !== hash) problems.push(`${file}: changed in core/ui (frozen)`);
    expectedMap.delete(file);
  }
  for (const file of expectedMap.keys()) problems.push(`${file}: removed from core/ui (frozen)`);
  return problems;
}

const problems = [...checkSources(), ...checkFrozen()];
if (problems.length > 0) {
  console.error("guards failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`guards: ok (${[...hashes("packages/core/src"), ...hashes("packages/ui/src")].length} frozen core/ui files)`);
