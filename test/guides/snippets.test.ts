import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { runSnippet } from "./run-snippet.js";

// Auto-discovers every guide snippet, so a new snippet file is executed
// without any test wiring (and a snippet that only typechecks can never
// slip through). Each snippet is a top-level-await script that throws when
// the flow it documents stops working, so running it IS the test. Each runs
// in its own process (see run-snippet.ts), so one snippet's state, open
// handles or failure cannot reach another.
//
// This suite runs in two execution tiers (see examples/guides/README.md):
//  - guides_pr.yml on every PR, against a local quickstart network via
//    `pnpm test:guides:local` (config/guides-snippet-preload.ts redirects
//    the testnet URLs at the transport layer)
//  - `preversion` at release time (or manual runs), against real testnet
//    via `pnpm test:guides`
// The timeout is sized for testnet; local runs finish far faster.
const snippets = Object.keys(import.meta.glob("../../examples/guides/*.ts"));

describe("guide snippets run end to end", () => {
  for (const path of snippets) {
    it(
      path.replace("../../examples/guides/", ""),
      { timeout: 120_000 },
      async ({ signal }) => {
        await runSnippet(fileURLToPath(new URL(path, import.meta.url)), signal);
      },
    );
  }
});
