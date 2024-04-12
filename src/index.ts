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

// Soroban RPC-related classes to expose
export * as SorobanRpc from './soroban';
export * from './contract_spec';

// expose classes and functions from stellar-base
export * from '@stellar/stellar-base';

export default module.exports;
