import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "club-results",
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
