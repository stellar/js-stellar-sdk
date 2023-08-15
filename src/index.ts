// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types

// stellar-sdk classes to expose
export * from './errors';
export { Config } from './config';
export { Server } from './horizon/server';
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE,
} from './federation_server';
export {
  StellarTomlResolver,
  STELLAR_TOML_MAX_SIZE,
} from './stellar_toml_resolver';
export {
  default as AxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime,
  version,
} from './axios';
export * from './utils';

// expose classes and functions from stellar-base
export * from 'stellar-base';

// expose all Horizon stuff
export * from './horizon';

// expose all Soroban stuff
export * as SorobanClient from './soroban';

export default module.exports;
