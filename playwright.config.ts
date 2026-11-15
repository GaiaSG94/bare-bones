import { defineConfig, devices } from "@playwright/test";

const BASE = "http://localhost:4170";
const server = {
  command: "node tools/assemble-e2e.mjs && node tools/serve.mjs .e2e-dist 4170",
  url: `${BASE}/`,
  reuseExistingServer: false,
  timeout: 60_000,
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 40_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: BASE, ...devices["Desktop Chrome"] },
  webServer: server,
});
