import { defineConfig } from "vitest/config";
import { resolve } from "path";
import packageJson from "../package.json" with { type: "json" };

const isAxios = process.env.TRANSPORT === "axios";
const sdkUnderTest = "../src/index.ts";
const httpClientUnderTest = isAxios
  ? "../src/http-client/axios.ts"
  : "../src/http-client/index.ts";
const coverageExclude = [
  "test/**",
  "dist/**",
  "coverage/**",
  "**/*.d.ts",
  "lib/**/*.d.ts",
  "lib/**",
  "**/*/browser.js",
];

function aliasHttpClientToAxiosSource() {
  return {
    name: "alias-http-client-to-axios-source",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (
        !isAxios ||
        !importer ||
        !importer.includes("/src/") ||
        !source.startsWith(".")
      ) {
        return null;
      }

      if (
        /(^|\/)http-client\/index\.js$/.test(source) ||
        /(^|\/)http-client$/.test(source)
      ) {
        return resolve(__dirname, "../src/http-client/axios.ts");
      }

      return null;
    },
  };
}

export default defineConfig({
  plugins: [aliasHttpClientToAxiosSource()],
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
      "@test/stellar-sdk": resolve(__dirname, sdkUnderTest),
      "@test/http-client": resolve(__dirname, httpClientUnderTest),
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
