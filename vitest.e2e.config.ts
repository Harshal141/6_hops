import { defineConfig } from "vitest/config";
import path from "node:path";

// The browser suite (e2e/), kept apart from `npm test`: it needs both dev servers and a
// throwaway Neon branch. Run with `npm run test:e2e`; see README.md, "End-to-end tests".
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["e2e/**/*.e2e.test.ts"],
    globalSetup: ["e2e/globalSetup.ts"],
    // One browser flow at a time against one pair of dev servers.
    fileParallelism: false,
    testTimeout: 240_000,
    hookTimeout: 240_000,
  },
});
