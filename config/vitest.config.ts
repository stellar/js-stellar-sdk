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
    // Only include non-browser tests in Node.js test runs
    include: ["test/unit/**/*.test.ts", "test/integration/**/*.test.ts"],
    exclude: ["**/browser.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
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
