/**
 * Utility for importing StellarSdk with proper TypeScript types in both browser
 * and Node.js environments. The actual build under test is selected by Vitest
 * aliases so the browser does not need dynamic imports during test setup.
 */

import * as sdkUnderTest from "@test/stellar-sdk";
import { httpClient as httpClientUnderTest } from "@test/http-client";
import type { xdr } from "../../lib/esm/index.js";
import type * as StellarSdkTypes from "../../lib/esm/index.js";

type StellarSdkModule = typeof StellarSdkTypes;

export const StellarSdk = sdkUnderTest as unknown as StellarSdkModule;

export async function getStellarSdk(): Promise<StellarSdkModule> {
  return StellarSdk;
}

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
  return httpClient;
}

// Export the httpClient instance
export const httpClient = httpClientUnderTest;
