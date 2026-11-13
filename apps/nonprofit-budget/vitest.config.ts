import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "nonprofit-budget",
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
