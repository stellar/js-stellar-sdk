// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from './errors';
export { Config } from './config';
export { Utils } from './utils';

// TOML and federation resolvers to expose
export * as Federation from './federation';

// Horizon-related classes to expose
export * as Horizon from './horizon';

// Soroban RPC-related classes to expose
export * as SorobanRpc from './soroban';
export { ContractSpec } from './soroban'; // not RPC related, so at top-level

// SEP-10 related helpers to expose
export * as Sep10 from './sep10';

// expose classes and functions from stellar-base
export * from 'stellar-base';

export default module.exports;
