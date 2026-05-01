import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { playwright } from "@vitest/browser-playwright";
import packageJson from "../package.json" with { type: "json" };

const isAxios = process.env.TRANSPORT === "axios";
const sdkUnderTest = "../src/index.ts";
const httpClientUnderTest = isAxios
  ? "../src/http-client/axios.ts"
  : "../src/http-client/index.ts";

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
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
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
      // Each browser test file imports the SDK source entrypoint, which fans
      // out into a large module graph. Loading many copies of that graph
      // concurrently has been flaky in Firefox on CI, surfacing as a generic
      // dynamic import failure.
      fileParallelism: false,
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
      "@test/stellar-sdk": resolve(__dirname, sdkUnderTest),
      "@test/http-client": resolve(__dirname, httpClientUnderTest),
      // js-xdr ships a `browser` field pointing at a webpack UMD that embeds
      // its own copy of `buffer`. When Vite picks that up, every value js-xdr
      // produces (e.g. xdr struct `_value` fields) becomes an instance of the
      // embedded Buffer class — different from the npm `Buffer` the SDK uses
      // everywhere else. Round-trip tests like
      // `expect(xdr.X.fromXDR(s.toXDR())).toEqual(s)` then fail with two
      // structurally-identical objects because their nested `Buffer`s have
      // different constructors. Force resolution to js-xdr's ESM source so
      // bare `Buffer` references resolve to the same global Buffer the rest
      // of the test environment sees.
      "@stellar/js-xdr": resolve(
        __dirname,
        "../node_modules/@stellar/js-xdr/src/index.js",
      ),
    },
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
  // Pre-bundle CJS deps the SDK pulls in. Without this, Vite lazily optimizes
  // them mid-run when a test first imports them, which triggers an
  // "unexpectedly reloaded" page reload that can leave already-loaded modules
  // pointing at stale exports. Listing them here makes the optimizer pre-build
  // them before tests start.
  // Pre-bundle every dep the SDK pulls in, including subpaths the optimizer
  // discovers lazily. Without this, Vite re-optimizes mid-run when a new
  // transitive dep is found, swaps the cache hash, and ESM modules already
  // loaded in the browser fail against the pre-bundled CJS shim. Listing
  // everything up front keeps the cache hash stable for the whole run.
  optimizeDeps: {
    include: [
      "@stellar/js-xdr",
      "axios",
      "feaxios",
      "eventsource",
      "smol-toml",
      "bignumber.js",
      "@noble/ed25519",
      "base32.js",
      "@noble/hashes/sha2.js",
      "buffer",
      "commander",
    ],
  },
});
