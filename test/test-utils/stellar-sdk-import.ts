/**
 * Utility for importing StellarSdk with proper TypeScript types in both browser and Node.js environments
 *
 * This file provides a typed import that works in both test environments:
 * - Browser: Uses the global StellarSdk loaded by setup-browser.ts
 * - Node.js: Uses the lib import with proper types
 */

// Import the types from the lib directory to get proper TypeScript support
import type { xdr } from "@stellar/stellar-base";
import type * as StellarSdkTypes from "../../lib";

// Import ScSpecTypeDef from stellar-base xdr namespace

// Type definition for the StellarSdk module
type StellarSdkModule = typeof StellarSdkTypes;

// Declare the global StellarSdk type for browser environment
declare global {
  interface Window {
    StellarSdk: StellarSdkModule;
  }
}

/**
 * Get the StellarSdk module with proper TypeScript types
 * Works in both browser and Node.js environments
 */
export function getStellarSdk(): StellarSdkModule {
  if (typeof window !== "undefined" && window.StellarSdk) {
    // Browser environment - use the global StellarSdk
    return window.StellarSdk;
  }
  // Node.js environment - require the lib module
  return require("../../lib");
}

// Export the StellarSdk instance with proper typing
export const StellarSdk = getStellarSdk();

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
} from "../../lib";

// Export specific types that are commonly used in tests
// Import Spec from the contract module
export type { Spec } from "../../lib/contract/spec";
export type ScSpecTypeDef = xdr.ScSpecTypeDef;

// Import commonly used Horizon types
export type { HorizonServer as Server } from "../../lib/horizon/server";

// Import commonly used base types
export type {
  Account,
  Asset,
  Keypair,
  Memo,
  Operation,
  Networks,
} from "@stellar/stellar-base";

/**
 * Get the httpClient with proper TypeScript types
 * Works in both browser and Node.js environments
 */
export function getHttpClient() {
  if (
    typeof window !== "undefined" &&
    (window as any).__STELLAR_SDK_BROWSER_TEST__
  ) {
    // In browser environment, get httpClient from global StellarSdk
    return (window as any).StellarSdk.httpClient;
  }
  // In Node.js environment, import directly
  const httpClientModule = require("../../lib/http-client");
  return httpClientModule.httpClient;
}

// Export the httpClient instance
export const httpClient = getHttpClient();
