#!/usr/bin/env node
/**
 * `create-bare-bones <app-name>` — copies the skeleton into a new app.
 * Usage: node create-bare-bones/index.mjs my-app [--dir=apps]
 */
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { isAbsolute, join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const name = positional[0];
const flagDir = process.argv.find((arg) => arg.startsWith("--dir="));
const targetDir = flagDir === undefined ? "apps" : flagDir.slice("--dir=".length);

if (name === undefined) {
  console.error("usage: create-bare-bones <app-name> [--dir=apps]");
  process.exit(2);
}
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("the app name must be lowercase letters, digits and dashes");
  process.exit(2);
}

const skeleton = join(root, "skeleton");
const base = isAbsolute(targetDir) ? targetDir : join(root, targetDir);
const target = join(base, name);
if (existsSync(target)) {
  console.error(`${target} already exists`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
for (const entry of readdirSync(skeleton)) {
  if (["node_modules", "dist", "package.json"].includes(entry)) continue;
  cpSync(join(skeleton, entry), join(target, entry), { recursive: true });
}

const pkg = JSON.parse(readFileSync(join(skeleton, "package.json"), "utf8"));
pkg.name = `@bare-bones/${name}`;
pkg.description = `${name} — a Bare Bones explorer.`;
writeFileSync(join(target, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

const configPath = join(target, "src/explorer.config.ts");
writeFileSync(configPath, readFileSync(configPath, "utf8").replace('id: "skeleton"', `id: "${name}"`));

console.log(`created ${target}`);
console.log("next:");
console.log(`  1. add the folder to pnpm-workspace.yaml if it is outside apps/, then run pnpm install`);
console.log(`  2. edit src/explorer.config.ts: importers, derivations, reducers, views, shareAdapters`);
console.log(`  3. pnpm --filter @bare-bones/${name} dev`);
