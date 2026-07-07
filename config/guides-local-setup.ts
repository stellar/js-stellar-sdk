/**
 * Vitest setup for running the guide snippets against a local
 * stellar/quickstart network (set GUIDES_TARGET=local) instead of live
 * testnet. Snippets keep the real testnet URLs and Networks.TESTNET so the
 * published docs stay honest; this harness redirects at the transport
 * layer instead of parameterizing the snippet text:
 *
 *  - globalThis.fetch rewrites the testnet hosts to the quickstart
 *    container (covers the SDK's fetch-based http-client, the eventsource
 *    package used for streaming, and bare `fetch` in snippet setup code)
 *  - Networks.TESTNET is remapped to the local network's passphrase, read
 *    from the local Horizon root, so transactions the snippets build and
 *    sign validate on the local core
 *
 * INVARIANT this relies on: everything that makes requests must resolve
 * `globalThis.fetch` lazily at call time, not capture it at module scope —
 * the SDK's module graph evaluates before this file's patch runs. The
 * canary below fails the suite loudly if the redirect is not live, so a
 * violation cannot silently send the PR gate to real testnet. Snippets
 * themselves must never reassign globalThis.fetch or mutate Networks.
 *
 * Used by the guides_pr.yml workflow (quickstart service container) and by
 * `pnpm test:guides:local` with a local container:
 *
 *   docker run --rm -p 8000:8000 -e NETWORK=local -e ENABLE_SOROBAN_RPC=true stellar/quickstart:testing
 *
 * `pnpm test:guides` (run by `preversion` at release time, or manually)
 * executes the same snippets against real testnet with no redirection.
 */
import { Networks } from "@stellar/stellar-sdk";

const LOCAL = process.env.QUICKSTART_URL ?? "http://localhost:8000";

function rewrite(url: string): string {
  const u = new URL(url);
  if (u.hostname === "friendbot.stellar.org") {
    return `${LOCAL}/friendbot${u.search}`;
  }
  if (u.hostname === "horizon-testnet.stellar.org") {
    return `${LOCAL}${u.pathname}${u.search}`;
  }
  if (u.hostname === "soroban-testnet.stellar.org") {
    return `${LOCAL}/soroban/rpc${u.search}`;
  }
  return url;
}

const realFetch = globalThis.fetch;
globalThis.fetch = ((
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  if (typeof input === "string" || input instanceof URL) {
    return realFetch(rewrite(String(input)), init);
  }
  const rewritten = rewrite(input.url);
  if (rewritten !== input.url) {
    return realFetch(new Request(rewritten, input), init);
  }
  return realFetch(input, init);
}) as typeof fetch;

// Preflight + canary: fetch the local Horizon root THROUGH the patched
// fetch. This proves on every run that (a) quickstart is up and (b) the
// redirect is actually intercepting testnet URLs, and it supplies the
// local passphrase without hardcoding it here.
let passphrase: string;
try {
  const res = await fetch("https://horizon-testnet.stellar.org/");
  passphrase = ((await res.json()) as { network_passphrase: string })
    .network_passphrase;
} catch {
  throw new Error(
    `guides-local-setup: quickstart is not reachable at ${LOCAL}. ` +
      `Start it with:\n\n  docker run --rm -p 8000:8000 -e NETWORK=local ` +
      `-e ENABLE_SOROBAN_RPC=true stellar/quickstart:testing\n\n(see ` +
      `examples/guides/README.md). Without Docker, run ` +
      `\`pnpm docs:snippets:check\` locally and let the guides_pr.yml ` +
      `workflow execute the snippets.`,
  );
}
if (
  !passphrase ||
  passphrase === "Test SDF Network ; September 2015" ||
  passphrase === Networks.PUBLIC
) {
  throw new Error(
    `guides-local-setup: redirect canary failed — the fetch patch reached ` +
      `a non-local network (passphrase: "${passphrase}"). Something in the ` +
      `module graph is capturing fetch at module scope instead of ` +
      `resolving globalThis.fetch at call time.`,
  );
}
(Networks as { TESTNET: string }).TESTNET = passphrase;
