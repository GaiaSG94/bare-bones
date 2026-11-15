import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

test("creates a new app with one config and one entry point", () => {
  const dir = mkdtempSync(join(tmpdir(), "bare-bones-") );
  try {
    execFileSync(process.execPath, ["create-bare-bones/index.mjs", "test-app", `--dir=${dir}`], { cwd: process.cwd() });
    assert.equal(existsSync(join(dir, "test-app/src/main.tsx")), true);
    assert.equal(existsSync(join(dir, "test-app/src/explorer.config.ts")), true);
    assert.match(readFileSync(join(dir, "test-app/package.json"), "utf8"), /@bare-bones\/test-app/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
