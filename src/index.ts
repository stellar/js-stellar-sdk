// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from './errors';
export { Config } from './config';
export { Sep10, Utils } from './utils';

// TOML and federation resolvers to expose
export * as Federation from './federation';

// Horizon-related classes to expose
export * as Horizon from './horizon';

// Soroban RPC-related classes to expose
export * as SorobanRpc from './soroban';

// expose classes and functions from stellar-base
export * from 'stellar-base';

export default module.exports;
