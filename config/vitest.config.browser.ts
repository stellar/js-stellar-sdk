import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    env: {
      VITE_TRANSPORT: process.env.TRANSPORT || "fetch",
    },
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      include: ["lib/esm/**/*.js"],
      exclude: [
        "test/**",
        "dist/**",
        "coverage/**",
        "**/*.d.ts",
        "lib/**/*.d.ts",
      ],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }, { browser: "firefox" }],
      headless: true,
      screenshotFailures: false,
    },
    // Run all unit tests in browser
    include: ["test/unit/**/*.test.ts"],
    exclude: [
      "test/unit/call_builders.test.ts",
      "test/unit/server/horizon/server.test.ts",
    ],
    // Setup files to load the browser bundle
    setupFiles: [resolve(__dirname, "../test/setup-browser.ts")],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
    },
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
