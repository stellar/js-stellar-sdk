/**
 * Utility for importing StellarSdk with proper TypeScript types in both browser and Node.js environments
 *
 * This file provides a typed import that works in both test environments:
 * - Browser: Uses the global StellarSdk loaded by setup-browser.ts
 * - Node.js: Uses the lib import with proper types
 */

import type { xdr } from "../../lib/esm/index.js";
import type * as StellarSdkTypes from "../../lib/esm/index.js";

type StellarSdkModule = typeof StellarSdkTypes;

function isAxiosTransport(): boolean {
  return (
    import.meta.env?.VITE_TRANSPORT === "axios" ||
    (typeof process !== "undefined" && process.env?.TRANSPORT === "axios")
  );
}

function getLibPath(): string {
  return isAxiosTransport() ? "../../lib/axios/esm" : "../../lib/esm";
}

export async function getStellarSdk(): Promise<StellarSdkModule> {
  return (await import(getLibPath())) as unknown as StellarSdkModule;
}

export const StellarSdk = await getStellarSdk();

// Re-export commonly used types for convenience
export type {
  Transaction,
  TransactionBuilder,
  Config,
  Utils,
  Horizon,
  Federation,
  WebAuth,
  StellarToml,
  Friendbot,
  rpc,
} from "../../lib/esm/index.js";

// Export specific types that are commonly used in tests
// Import Spec from the contract module
export type { Spec } from "../../lib/esm/contract/spec.js";
export type ScSpecTypeDef = xdr.ScSpecTypeDef;

// Import commonly used Horizon types
export type { HorizonServer as Server } from "../../lib/esm/horizon/server.js";

// Import commonly used base types
export type {
  Account,
  Asset,
  Keypair,
  Memo,
  Operation,
  Networks,
} from "../../lib/esm/base/index.js";

// The axios lib tree still has a fetch-backed `http-client/index.js` (the file
// itself isn't aliased — only downstream imports of `../http-client` are). So
// to get the axios client we reach for the explicit `http-client/axios` subpath.
export async function getHttpClient() {
  const subpath =
    typeof process !== "undefined" && process.env?.TRANSPORT === "axios"
      ? "/http-client/axios"
      : "/http-client";
  const httpClientModule = await import(`${getLibPath()}${subpath}`);
  return httpClientModule.httpClient;
}

// Export the httpClient instance
export const httpClient = await getHttpClient();
