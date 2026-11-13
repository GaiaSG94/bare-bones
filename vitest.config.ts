import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

const candidates = ["packages/core", "packages/ui", "skeleton", "apps/nonprofit-budget", "apps/club-results"];
const projects = candidates.filter((dir) => existsSync(dir));

export default defineConfig({
  test: {
    projects,
    reporters: "default",
  },
});
