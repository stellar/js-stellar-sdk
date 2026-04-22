import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // This config runs tests against lib/axios (TRANSPORT=axios routes the
      // test harness there). Scope coverage to that build so the report
      // reflects what's actually under test; the default fetch build is
      // covered by vitest.config.ts.
      include: ["lib/axios/**/*.js"],
      exclude: [
        "test/**",
        "dist/**",
        "coverage/**",
        "**/*.d.ts",
        "lib/**/*.d.ts",
        "**/*/browser.js",
      ],
    },
    testTimeout: 20000,
    include: ["test/unit/**/*.test.ts"],
    exclude: ["**/browser.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },

  define: {
    __USE_EVENTSOURCE__: true,
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
