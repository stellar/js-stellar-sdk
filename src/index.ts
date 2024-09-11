// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from './errors';
export { Config } from './config';
export { Utils } from './utils';

// TOML (SEP-1), Federation (SEP-2), and WebAuth (SEP-10) helpers to expose
export * as StellarToml from './stellartoml';
export * as Federation from './federation';
export * as WebAuth from './webauth';

export * as Friendbot from './friendbot';

// Horizon-related classes to expose
export * as Horizon from './horizon';

/**
 * Tools for interacting with the Soroban RPC server, such as `Server`,
 * `assembleTransaction`, and the `Api` types. You can import these from the
 * `/rpc` entrypoint, if your version of Node and your TypeScript configuration
 * allow it:
 *
 * ```ts
 * import { Server } from '@stellar/stellar-sdk/rpc';
 * ```
 */
export * as rpc from './rpc';

/**
 * @deprecated Use `rpc` instead
 */
export * as SorobanRpc from './rpc';

/**
 * Tools for interacting with smart contracts, such as `Client`, `Spec`, and
 * `AssembledTransaction`. You can import these from the `/contract`
 * entrypoint, if your version of Node and your TypeScript configuration allow
 * it:
 *
 * ```ts
 * import { Client } from '@stellar/stellar-sdk/contract';
 * ```
 */
export * as contract from './contract'

// expose classes and functions from stellar-base
export * from '@stellar/stellar-base';

export default module.exports;

if (typeof (global as any).__USE_AXIOS__ === 'undefined') {
    (global as any).__USE_AXIOS__ = true;
}

if (typeof (global as any).__USE_EVENTSOURCE__ === 'undefined') {
    (global as any).__USE_EVENTSOURCE__ = false;
}