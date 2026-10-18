import { defineConfig, configDefaults } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    // e2e/ is the browser suite (vitest.e2e.config.ts, `npm run test:e2e`), not a unit test.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
