/* tslint:disable-next-line:no-var-requires */
require("es6-promise").polyfill();

import { version } from "../package.json";

// Expose all types
export * from "./horizon_api_types";
export * from "./server_types";

// stellar-sdk classes to expose
export * from "./errors";
export { Config } from "./config";
export { Server } from "./server";
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE,
} from "./federation_server";
export {
  StellarTomlResolver,
  STELLAR_TOML_MAX_SIZE,
} from "./stellar_toml_resolver";
export {
  default as HorizonAxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime,
} from "./horizon_axios_client";

// expose classes and functions from stellar-base
export * from "stellar-base";

export { version };

export default module.exports;
