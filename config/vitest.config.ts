import { defineConfig } from "vitest/config";
import { resolve } from "path";
import packageJson from "../package.json" with { type: "json" };
import { aliasHttpClientToAxiosSource } from "./vitest-utils";

const isAxios = process.env.TRANSPORT === "axios";

const coverageExclude = [
  "test/**",
  "dist/**",
  "coverage/**",
  "**/*.d.ts",
  "lib/**/*.d.ts",
  "lib/**",
  "**/*/browser.js",
  // Astro content collection schema for the docs site; imports the
  // virtual `astro:content` module that only resolves inside Astro's
  // runtime. Not SDK code, not in scope for SDK coverage.
  "src/content.config.ts",
];

export default defineConfig({
  plugins: [aliasHttpClientToAxiosSource(isAxios)],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: coverageExclude,
      all: true,
    },
    testTimeout: 20000,
    // GUIDES_TARGET=local reruns the guide snippets against a local
    // quickstart network instead of live testnet (see guides-local-setup.ts).
    setupFiles:
      process.env.GUIDES_TARGET === "local"
        ? [resolve(__dirname, "guides-local-setup.ts")]
        : [],
    // Only include non-browser tests in Node.js test runs
    include: [
      "test/unit/**/*.test.ts",
      "test/integration/**/*.test.ts",
      "test/guides/**/*.test.ts",
    ],
    exclude: ["**/browser.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
      // Guide snippets (examples/guides) import the package the way
      // readers would; resolve that to src/ so they run against current code.
      "@stellar/stellar-sdk": resolve(__dirname, "../src/index.ts"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  esbuild: {
    target: "node20",
  },
  optimizeDeps: {
    include: ["axios"],
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
