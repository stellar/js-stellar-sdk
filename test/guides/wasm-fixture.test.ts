import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { runSnippet } from "./run-snippet.js";

describe("the checked-in wasm fixture", () => {
  it(
    "deploys and invokes from hidden setup",
    { timeout: 120_000 },
    async ({ signal }) => {
      await runSnippet(
        fileURLToPath(new URL("fixtures/deploy-increment.ts", import.meta.url)),
        signal,
      );
    },
  );
});
