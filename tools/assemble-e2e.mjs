#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const target = join(root, ".e2e-dist");
if (existsSync(target)) rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const [source, destination] of [
  ["site/dist", ""],
  ["apps/nonprofit-budget/dist", "budget"],
  ["apps/club-results/dist", "club"],
  ["skeleton/dist", "skeleton"],
]) {
  const destinationPath = join(target, destination);
  mkdirSync(destinationPath, { recursive: true });
  cpSync(join(root, source), destinationPath, { recursive: true });
}
console.log(`assembled ${target}`);
