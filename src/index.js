require('es6-promise').polyfill();

// kin-sdk classes to expose
export * from "./errors";
export {Config} from "./config";
export {Server} from "./server";
export {FederationServer, FEDERATION_RESPONSE_MAX_SIZE} from "./federation_server";
export {StellarTomlResolver, STELLAR_TOML_MAX_SIZE} from "./stellar_toml_resolver";

// expose classes and functions from kin-base
export * from "@kinecosystem/kin-base";

export default module.exports;
