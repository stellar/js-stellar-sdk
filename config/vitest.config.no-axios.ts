import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // This config runs tests against lib/no-axios (USE_AXIOS=false routes
      // the test harness there). Scope coverage to that build so the report
      // reflects what's actually under test; the default axios build is
      // covered by vitest.config.ts.
      include: ["lib/no-axios/**/*.js"],
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
    // horizon_axios_client is wired to axios-mock-adapter and cannot run on the fetch path.
    exclude: ["**/browser.test.ts", "test/unit/horizon_axios_client.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },

  define: {
    __USE_AXIOS__: false,
    __USE_EVENTSOURCE__: true,
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
