import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: { three: ["three"] },
      },
    },
  },
});
