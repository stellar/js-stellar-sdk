require('es6-promise').polyfill();

// stellar-sdk classes to expose
export * from './errors';
export { Config } from './Config';
export { Server } from './Server';
export { FederationServer, FEDERATION_RESPONSE_MAX_SIZE } from './FederationServer';
export { StellarTomlResolver, STELLAR_TOML_MAX_SIZE } from './StellarTomlResolver';

// expose classes and functions from stellar-base
export * from 'stellar-base';

export default module.exports;
