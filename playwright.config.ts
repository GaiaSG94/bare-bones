import { defineConfig, devices } from "@playwright/test";

const BUDGET_URL = "http://localhost:4171/budget/";
const CLUB_URL = "http://localhost:4172/club/";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: BUDGET_URL, ...devices["Desktop Chrome"] },
  projects: [{ name: "states", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @bare-bones/nonprofit-budget exec vite preview --port 4171 --strictPort",
      url: BUDGET_URL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @bare-bones/club-results exec vite preview --port 4172 --strictPort",
      url: CLUB_URL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
