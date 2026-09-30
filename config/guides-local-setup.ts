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
 *   docker run --rm -p 8000:8000 -e NETWORK=local -e ENABLE_SOROBAN_RPC=true -e PROTOCOL_VERSION=28 stellar/quickstart:testing
 *
 * `pnpm test:guides` (run by `preversion` at release time, or manually)
 * executes the same snippets against real testnet with no redirection.
 */
// Before the container exists, nothing listens on the port and the
// connection is refused; that fails after a short grace window. Once it runs,
// early requests are reset and then answered 5xx, so those are retried.
// Horizon then keeps returning 503 still_ingesting on data endpoints for a
// while, and friendbot can answer 502 after that. Snippets fund an account
// and call loadAccount straight away, so wait for both before the first
// snippet runs.
const READY_TIMEOUT_MS = 120_000;
const REFUSED_GRACE_MS = 10_000;
const READY_POLL_MS = 1_000;
const ATTEMPT_TIMEOUT_MS = 5_000;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function startHint(): string {
  return (
    `Start it with:\n\n  docker run --rm -p 8000:8000 -e NETWORK=local ` +
    `-e ENABLE_SOROBAN_RPC=true -e PROTOCOL_VERSION=28 ` +
    `stellar/quickstart:testing\n\n(see ` +
    `examples/guides/README.md). Without Docker, run ` +
    `\`pnpm docs:snippets:check\` locally and let the guides_pr.yml ` +
    `workflow execute the snippets.`
  );
}

/** The cause code of a fetch error, which "fetch failed" alone hides. */
function errorCode(e: unknown): string | undefined {
  const cause = e instanceof Error ? e.cause : undefined;
  return typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    typeof cause.code === "string"
    ? cause.code
    : undefined;
}

interface Wait {
  local: string;
  deadline: number;
  refusedDeadline: number;
  attemptTimeoutMs: number;
  pollMs: number;
}

/** Timing knobs with the quickstart defaults; tests pass small values. */
export interface WaitOptions {
  refusedGraceMs?: number;
  attemptTimeoutMs?: number;
  pollMs?: number;
}

/**
 * Polls `url` until `ready` accepts its status, and throws `timeoutError`
 * with the last result once the deadline passes. `ready` runs outside the
 * fetch's `try`, so it can throw to stop at once.
 */
async function pollUntil(
  url: string,
  ready: (status: number) => boolean,
  wait: Wait,
  timeoutError: (last: string) => Error,
): Promise<void> {
  let last = "no response";
  for (;;) {
    let status: number | undefined;
    try {
      // Bound each attempt: the deadline below is only checked between them.
      const res = await fetch(url, {
        signal: AbortSignal.timeout(wait.attemptTimeoutMs),
      });
      // Only the status matters here, and an unread body keeps its socket open.
      await res.body?.cancel();
      status = res.status;
    } catch (e) {
      const code = errorCode(e);
      const message = e instanceof Error ? e.message : String(e);
      last = code === undefined ? message : `${message} (${code})`;
      if (code === "ECONNREFUSED" && Date.now() >= wait.refusedDeadline) {
        throw new Error(
          `guides-local-setup: nothing is listening at ${wait.local} ` +
            `(last result: ${last}), so quickstart is not running. ` +
            startHint(),
        );
      }
    }
    if (status !== undefined) {
      if (ready(status)) return;
      last = `HTTP ${status}`;
    }
    if (Date.now() >= wait.deadline) throw timeoutError(last);
    await pause(wait.pollMs);
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
  {
    refusedGraceMs = REFUSED_GRACE_MS,
    attemptTimeoutMs = ATTEMPT_TIMEOUT_MS,
    pollMs = READY_POLL_MS,
  }: WaitOptions = {},
): Promise<void> {
  const started = Date.now();
  const wait: Wait = {
    local,
    deadline: started + readyTimeoutMs,
    refusedDeadline: started + refusedGraceMs,
    attemptTimeoutMs,
    pollMs,
  };
  const seconds = readyTimeoutMs / 1000;

  await pollUntil(
    `${local}/`,
    (status) => {
      if (status >= 200 && status < 300) return true;
      if (status < 500) {
        throw new Error(
          `guides-local-setup: ${local}/ answered HTTP ${status}, so it is ` +
            `not a quickstart Horizon root. Check what is listening there.`,
        );
      }
      return false;
    },
    wait,
    (last) =>
      new Error(
        `guides-local-setup: quickstart is not reachable at ${local} after ` +
          `${seconds}s (last result: ${last}), or it is still starting. ` +
          startHint(),
      ),
  );

  // An unfunded account: Horizon answers 404 for it once it serves data.
  await pollUntil(
    `${local}/accounts/GDOXEPLD762SXIP2P7JZPOAR2TMISOROTA42XQMHHO5NN47H6R2PSNNA`,
    (status) => (status >= 200 && status < 300) || status === 404,
    wait,
    (last) =>
      new Error(
        `guides-local-setup: Horizon at ${local} is not serving data after ` +
          `${seconds}s (last result: ${last}). The container reports ` +
          `healthy before ingestion catches up, so the suite waits for it ` +
          `here.`,
      ),
  );

  // Without an addr, a ready friendbot answers 400, as the CI health check
  // expects. Any other 4xx means no friendbot is there, so that fails at once.
  await pollUntil(
    `${local}/friendbot`,
    (status) => {
      if (status === 400) return true;
      if (status < 500) {
        throw new Error(
          `guides-local-setup: ${local}/friendbot answered HTTP ${status}, so ` +
            `there is no friendbot route. Check what is listening there.`,
        );
      }
      return false;
    },
    wait,
    (last) =>
      new Error(
        `guides-local-setup: friendbot at ${local} is not ready after ` +
          `${seconds}s (last result: ${last}).`,
      ),
  );
}
