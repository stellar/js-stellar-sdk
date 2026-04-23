// Expose all types
export * from "./errors/index.js";
export { Config } from "./config.js";
export { Utils } from "./utils.js";

// TOML (SEP-1), Federation (SEP-2), and WebAuth (SEP-10) helpers to expose
export * as StellarToml from "./stellartoml/index.js";
export * as Federation from "./federation/index.js";
export * as WebAuth from "./webauth/index.js";

export * as Friendbot from "./friendbot/index.js";

// Horizon-related classes to expose
export * as Horizon from "./horizon/index.js";

/**
 * Tools for interacting with the Soroban RPC server, such as `Server`,
 * `assembleTransaction`, and the `Api` types. You can import these from the
 * `/rpc` entrypoint, if your version of Node and your TypeScript configuration
 * allow it:
 * @example
 * import { Server } from '@stellar/stellar-sdk/rpc';
 */
export * as rpc from "./rpc/index.js";

/**
 * Tools for interacting with smart contracts, such as `Client`, `Spec`, and
 * `AssembledTransaction`. You can import these from the `/contract`
 * entrypoint, if your version of Node and your TypeScript configuration allow
 * it:
 * @example
 * import { Client } from '@stellar/stellar-sdk/contract';
 */
export * as contract from "./contract/index.js";
export { BindingGenerator } from "./bindings/index.js";
// expose classes and functions from stellar-base
export * from "@stellar/stellar-base";
