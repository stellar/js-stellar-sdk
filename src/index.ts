// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from './horizon';
export * from './soroban/soroban_rpc';

// stellar-sdk classes to expose
export * from './errors';
export { Config } from './config';
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE
} from './federation/federation_server';
export {
  StellarTomlResolver,
  STELLAR_TOML_MAX_SIZE
} from './federation/stellar_toml_resolver';

export {
  default as HorizonAxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime,
  version
} from './horizon/horizon_axios_client';

export { Server as HorizonServer } from './horizon/server';

export * from './utils';

// soroban-client classes to expose
export { SorobanClient, AxiosClient as SorobanAxiosClient } from './soroban';

export * from './soroban/transaction';

// expose classes and functions from stellar-base
export * from 'stellar-base';

export default module.exports;
