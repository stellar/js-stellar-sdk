import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import packageJson from "../package.json" with { type: "json" };
import { aliasHttpClientToAxiosSource } from "./vitest-utils";
import { resolve } from "path";
const isAxios = process.env.TRANSPORT === "axios";

export default defineConfig({
  plugins: [aliasHttpClientToAxiosSource(isAxios)],
  // The two transports produce different module graphs (the plugin above
  // rewrites the http-client entrypoint), so they hash to different Vite
  // configs. Sharing one cache dir makes each run discard the other's
  // pre-bundled deps — every axios run started with "Re-optimizing
  // dependencies because vite config has changed" and paid the full optimize
  // cost again. One dir per transport keeps both caches warm.
  cacheDir: resolve(
    __dirname,
    `../node_modules/.vite/browser-${isAxios ? "axios" : "fetch"}`,
  ),
  test: {
    globals: true,
    environment: "jsdom",
    // Reuse one iframe across all test files instead of creating a fresh one
    // per file. Every test file imports the SDK source entrypoint, so with
    // isolation each of the 117 files re-evaluated the ~470-module `src/xdr`
    // graph from scratch; the browser page grew until Firefox lost it mid-run
    // ("Browser connection was closed while running tests"), consistently
    // around file ~60 with every test that had run passing. Sharing the iframe
    // evaluates that graph once, which keeps memory flat and cuts the run from
    // ~16s to ~6s.
    //
    // The trade-off is that module state is shared across files, so a
    // `vi.mock` here leaks into every file that runs after it. The suite is
    // kept mock-free for that reason: tests that need a stubbed transport
    // inject a `Server` and spy on `server.httpClient` instead (see
    // test/unit/contract/client_from.test.ts and test/unit/server/soroban/).
    isolate: false,
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
        // Astro content collection schema for the docs site; imports
        // the virtual `astro:content` module that only resolves inside
        // Astro's runtime. Not SDK code, not in scope for SDK coverage.
        "src/content.config.ts",
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
      // Node-only class-XDR tests: they read corpus/fixture files from disk
      // via `node:fs`, which isn't available in the browser environment.
      "test/unit/xdr/corpus_round_trip.test.ts",
      "test/unit/xdr/schema_exhaustive.test.ts",
      // Node-only: compares against legacy js-xdr v4, whose API requires
      // `node:buffer` Buffers.
      "test/unit/xdr/legacy_round_trip.test.ts",
      // Tests the docs snippet-expansion machinery (config/snippets.ts),
      // which reads snippet files with node:fs — Node-only, not SDK code.
      "test/unit/guide-snippets.test.ts",
    ],
    // Setup files to load the browser bundle
    setupFiles: [resolve(__dirname, "../test/setup-browser.ts")],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src"),
      // Note: js-xdr v5 ships a proper dual ESM/CJS build (no `browser`-field
      // UMD embedding its own `buffer`), so the v4-era alias forcing resolution
      // to js-xdr's source is no longer needed — Vite resolves it via the
      // package `exports` map to the ESM build.
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
      "@exodus/bytes/base32.js",
      "@noble/hashes/sha2.js",
      "commander",
    ],
  },
});
