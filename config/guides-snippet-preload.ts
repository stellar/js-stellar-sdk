/**
 * Preloaded (`node --import`) into every guide-snippet child process that test/guides/run-snippet.ts starts. The child runs under tsx, not vite, so it gets none of the vitest config's defines; this file supplies what the snippets need before they import the SDK.
 *
 * With GUIDES_TARGET=local it also redirects the snippets to a local stellar/quickstart network. Snippets keep the real testnet URLs and Networks.TESTNET so the published docs stay honest; this redirects at the transport layer instead of parameterizing the snippet text:
 *
 *  - globalThis.fetch rewrites the testnet hosts to the quickstart container (covers the SDK's fetch-based http-client, the eventsource package used for streaming, and bare `fetch` in snippet setup code)
 *  - Networks.TESTNET is remapped to the local network's passphrase, read from the local Horizon root, so transactions the snippets build and sign validate on the local core
 *
 * The SDK loads only after the fetch patch, so no SDK module can capture the unpatched fetch. Snippets themselves must never reassign globalThis.fetch or mutate Networks.
 *
 * The once-per-run Horizon ingestion wait is in guides-local-setup.ts (vitest globalSetup), so the children do not each pay for it.
 */
import pkg from "../package.json" with { type: "json" };

// src/ reads this build-time define at module scope, so it must be set before anything imports the SDK.
Object.assign(globalThis, { __PACKAGE_VERSION__: pkg.version });

// Without the tsconfig `paths` entry, Node resolves the package name to the lib/ build, and the snippets would test stale code with no error.
const sdk = import.meta.resolve("@stellar/stellar-sdk");
if (!sdk.endsWith("/src/index.ts")) {
  throw new Error(
    `guides-snippet-preload: @stellar/stellar-sdk resolves to ${sdk}, not ` +
      `src/index.ts. Start snippets through test/guides/run-snippet.ts, ` +
      `which sets TSX_TSCONFIG_PATH.`,
  );
}

if (process.env.GUIDES_TARGET === "local") {
  const LOCAL = process.env.QUICKSTART_URL ?? "http://localhost:8000";

  const rewrite = (url: string): string => {
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
  };

  const realFetch = globalThis.fetch;
  globalThis.fetch = (
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
  };

  const { Networks } = await import("@stellar/stellar-sdk");

  // Canary: fetch the local Horizon root THROUGH the patched fetch. This proves in every child that the redirect is intercepting testnet URLs, and it supplies the local passphrase without hardcoding it here.
  let passphrase: unknown;
  try {
    const res = await fetch("https://horizon-testnet.stellar.org/");
    const body: unknown = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "network_passphrase" in body
    ) {
      passphrase = body.network_passphrase;
    }
  } catch (e) {
    throw new Error(
      `guides-snippet-preload: redirect canary could not read the local ` +
        `Horizon root at ${LOCAL} (${e instanceof Error ? e.message : String(e)}).`,
    );
  }
  if (
    typeof passphrase !== "string" ||
    passphrase === "Test SDF Network ; September 2015" ||
    passphrase === Networks.PUBLIC
  ) {
    throw new Error(
      `guides-snippet-preload: redirect canary failed — the fetch patch ` +
        `reached a non-local network (passphrase: "${String(passphrase)}").`,
    );
  }
  Object.assign(Networks, { TESTNET: passphrase });
}
