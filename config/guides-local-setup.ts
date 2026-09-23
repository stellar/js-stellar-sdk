/**
 * Vitest globalSetup for running the guide snippets against a local
 * stellar/quickstart network (set GUIDES_TARGET=local) instead of live
 * testnet. It runs ONCE, in the vitest parent, before any snippet starts.
 * The per-snippet redirect lives in guides-snippet-preload.ts, which every
 * snippet child process loads.
 *
 * Used by the guides_pr.yml workflow (quickstart service container) and by
 * `pnpm test:guides:local` with a local container:
 *
 *   docker run --rm -p 8000:8000 -e NETWORK=local -e ENABLE_SOROBAN_RPC=true stellar/quickstart:testing
 *
 * `pnpm test:guides` (run by `preversion` at release time, or manually)
 * executes the same snippets against real testnet with no redirection.
 */
// Not the package entry: it loads the Horizon client, which reads a
// build-time define that vitest does not inject into globalSetup.
import { Keypair } from "../src/base/keypair.js";

// quickstart reports healthy once Soroban RPC and friendbot answer, but
// Horizon keeps returning 503 still_ingesting on data endpoints for a while
// after that. Snippets call loadAccount straight after funding, so wait for
// /accounts to stop returning 503 before the first snippet runs.
const READY_TIMEOUT_MS = 120_000;
const READY_POLL_MS = 1_000;
const ATTEMPT_TIMEOUT_MS = 5_000;

export default async function setup(): Promise<void> {
  // Read per call, not at module scope, so a caller can point it elsewhere.
  const LOCAL = process.env.QUICKSTART_URL ?? "http://localhost:8000";

  let root: Response;
  try {
    root = await fetch(`${LOCAL}/`, {
      signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
    });
  } catch (e) {
    throw new Error(
      `guides-local-setup: quickstart is not reachable at ${LOCAL} ` +
        `(${e instanceof Error ? e.message : String(e)}). Start it with:\n\n  docker run --rm -p 8000:8000 -e NETWORK=local ` +
        `-e ENABLE_SOROBAN_RPC=true stellar/quickstart:testing\n\n(see ` +
        `examples/guides/README.md). Without Docker, run ` +
        `\`pnpm docs:snippets:check\` locally and let the guides_pr.yml ` +
        `workflow execute the snippets.`,
    );
  }
  if (!root.ok) {
    throw new Error(
      `guides-local-setup: ${LOCAL}/ answered HTTP ${root.status}, so it is ` +
        `not a quickstart Horizon root. Check what is listening there.`,
    );
  }

  const probe = `${LOCAL}/accounts/${Keypair.random().publicKey()}`;
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastStatus: number | string = "no response";
  for (;;) {
    try {
      // Bound each attempt: the deadline below is only checked between them.
      const res = await fetch(probe, {
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
      // 404 is the ready signal: Horizon served a data endpoint and the
      // random account simply does not exist.
      if (res.ok || res.status === 404) return;
      lastStatus = res.status;
    } catch (e) {
      lastStatus = e instanceof Error ? e.message : String(e);
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `guides-local-setup: Horizon at ${LOCAL} is not serving data after ` +
          `${READY_TIMEOUT_MS / 1000}s (last result: ${lastStatus}). The ` +
          `container reports healthy before ingestion catches up, so the ` +
          `suite waits for it here.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
  }
}
