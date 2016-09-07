require('es6-promise').polyfill();

// stellar-sdk classes to expose
export * from "./errors";
export {Server} from "./server";
export {FederationServer} from "./federation_server";
export {StellarTomlResolver} from "./stellar_toml_resolver";

// expose classes and functions from stellar-base
export * from "stellar-base";

export default module.exports;
