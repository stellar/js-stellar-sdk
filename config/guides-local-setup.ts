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
// While quickstart starts, its root refuses connections or answers 5xx, so
// both are retried. Horizon then keeps returning 503 still_ingesting on data
// endpoints for a while, and friendbot can answer 502 after that. Snippets
// fund an account and call loadAccount straight away, so wait for both
// before the first snippet runs.
const READY_TIMEOUT_MS = 120_000;
const READY_POLL_MS = 1_000;
const ATTEMPT_TIMEOUT_MS = 5_000;

const pause = () =>
  new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));

/**
 * Polls `url` until `ready` accepts its status. Returns undefined when it
 * does, or the last status or error once the deadline passes.
 */
async function pollUntil(
  url: string,
  ready: (status: number) => boolean,
  deadline: number,
): Promise<string | undefined> {
  let last = "no response";
  for (;;) {
    try {
      // Bound each attempt: the deadline below is only checked between them.
      const res = await fetch(url, {
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
      await res.body?.cancel();
      if (ready(res.status)) return undefined;
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
    if (Date.now() >= deadline) return last;
    await pause();
  }
}

export default async function setup(): Promise<void> {
  // Read per call, not at module scope, so a caller can point it elsewhere.
  await waitForQuickstart(
    process.env.QUICKSTART_URL ?? "http://localhost:8000",
    READY_TIMEOUT_MS,
  );
}

export async function waitForQuickstart(
  local: string,
  readyTimeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + readyTimeoutMs;

  let lastRoot = "no response";
  for (;;) {
    let root: Response | undefined;
    try {
      root = await fetch(`${local}/`, {
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
    } catch (e) {
      lastRoot = e instanceof Error ? e.message : String(e);
    }
    if (root !== undefined) {
      // Only the status matters here, and an unread body keeps its socket open.
      await root.body?.cancel();
      if (root.ok) break;
      if (root.status < 500) {
        throw new Error(
          `guides-local-setup: ${local}/ answered HTTP ${root.status}, so it ` +
            `is not a quickstart Horizon root. Check what is listening there.`,
        );
      }
      lastRoot = `HTTP ${root.status}`;
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `guides-local-setup: quickstart is not reachable at ${local} after ` +
          `${readyTimeoutMs / 1000}s (last result: ${lastRoot}), or it is ` +
          `still starting. Start it with:\n\n  docker run --rm -p 8000:8000 ` +
          `-e NETWORK=local -e ENABLE_SOROBAN_RPC=true ` +
          `stellar/quickstart:testing\n\n(see examples/guides/README.md). ` +
          `Without Docker, run \`pnpm docs:snippets:check\` locally and let ` +
          `the guides_pr.yml workflow execute the snippets.`,
      );
    }
    await pause();
  }

  // An unfunded account: Horizon answers 404 for it once it serves data.
  const accounts = await pollUntil(
    `${local}/accounts/GDOXEPLD762SXIP2P7JZPOAR2TMISOROTA42XQMHHO5NN47H6R2PSNNA`,
    (status) => (status >= 200 && status < 300) || status === 404,
    deadline,
  );
  if (accounts !== undefined) {
    throw new Error(
      `guides-local-setup: Horizon at ${local} is not serving data after ` +
        `${readyTimeoutMs / 1000}s (last result: ${accounts}). The ` +
        `container reports healthy before ingestion catches up, so the ` +
        `suite waits for it here.`,
    );
  }

  // Without an addr, a ready friendbot answers 400, as the CI health check expects.
  const friendbot = await pollUntil(
    `${local}/friendbot`,
    (status) => status < 500,
    deadline,
  );
  if (friendbot !== undefined) {
    throw new Error(
      `guides-local-setup: friendbot at ${local} is not ready after ` +
        `${readyTimeoutMs / 1000}s (last result: ${friendbot}).`,
    );
  }
}
