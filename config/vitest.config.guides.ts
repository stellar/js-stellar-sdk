import { mergeConfig, defineConfig } from "vitest/config";
import { resolve } from "path";
import baseConfig from "./vitest.config";

/**
 * Config for the guide-snippet suite (test/guides) ONLY. Kept out of the
 * shared vitest.config.ts on purpose: these tests execute the docs guide
 * scripts, which submit real testnet transactions unless GUIDES_TARGET=local
 * redirects them (see guides-snippet-preload.ts) — they must never run because
 * someone invoked the default config without a path filter.
 */
const config = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: { enabled: false },
      // GUIDES_TARGET=local reruns the guide snippets against a local
      // quickstart network instead of live testnet. This waits for it once;
      // each snippet child redirects itself (guides-snippet-preload.ts).
      globalSetup:
        process.env.GUIDES_TARGET === "local"
          ? [resolve(__dirname, "guides-local-setup.ts")]
          : [],
    },
  }),
);

// Assigned after the merge because mergeConfig concatenates arrays — merging
// an include would APPEND to the base list and run unit/integration too.
config.test.include = ["test/guides/**/*.test.ts"];

export default config;
