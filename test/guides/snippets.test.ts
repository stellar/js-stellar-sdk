import { describe, it } from "vitest";

// Auto-discovers every guide snippet, so a new snippet file is executed
// without any test wiring (and a snippet that only typechecks can never
// slip through). Each snippet is a top-level-await script that throws when
// the flow it documents stops working, so importing it IS the test.
//
// This suite runs in two execution tiers (see examples/guides/README.md):
//  - guides_pr.yml on every PR, against a local quickstart network via
//    `pnpm test:guides:local` (config/guides-local-setup.ts redirects the
//    testnet URLs at the transport layer)
//  - `preversion` at release time (or manual runs), against real testnet
//    via `pnpm test:guides`
// The timeout is sized for testnet; local runs finish far faster.
const snippets = import.meta.glob("../../examples/guides/*.ts");

describe("guide snippets run end to end", () => {
  for (const [path, load] of Object.entries(snippets)) {
    it(
      path.replace("../../examples/guides/", ""),
      { timeout: 120_000 },
      async () => {
        await load();
      },
    );
  }
});
