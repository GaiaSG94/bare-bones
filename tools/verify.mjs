import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED = [
  "LICENSE",
  "README.md",
  ".kiro/steering/product.md",
  ".kiro/steering/tech.md",
  ".kiro/steering/code-style.md",
  ".kiro/steering/design-system.md",
  ".kiro/specs/core-types/requirements.md",
  ".kiro/specs/core-types/design.md",
  ".kiro/specs/core-types/tasks.md",
];

const FORBIDDEN = [
  { path: ".gitignore", pattern: /\.kiro\//, why: ".kiro must never be gitignored" },
];

function checkRequired() {
  const missing = REQUIRED.filter((p) => !existsSync(resolve(root, p)));
  return missing.map((p) => `missing file: ${p}`);
}

function checkForbidden() {
  const problems = [];
  for (const { path, pattern, why } of FORBIDDEN) {
    const full = resolve(root, path);
    if (existsSync(full) && pattern.test(readFileSync(full, "utf8"))) {
      problems.push(`${path}: ${why}`);
    }
  }
  return problems;
}

function checkLicense() {
  const text = readFileSync(resolve(root, "LICENSE"), "utf8");
  return text.startsWith("MIT License") ? [] : ["LICENSE: not detected as MIT"];
}

function main() {
  const problems = [...checkRequired(), ...checkForbidden(), ...checkLicense()];
  if (problems.length > 0) {
    console.error("verify failed:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("verify ok: repo invariants hold");
}

main();
