// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

/* tslint:disable:no-var-requires */
const version = require("../package.json").version;

// Expose all types
export * from "./horizon";

// stellar-sdk classes to expose
export * from "./errors";
export { Config } from "./config";
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE
} from "./federation/federation_server";
export {
  StellarTomlResolver,
  STELLAR_TOML_MAX_SIZE
} from "./federation/stellar_toml_resolver";
export {
  default as HorizonAxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime
} from "./horizon/horizon_axios_client";
export * from "./utils";

// expose classes and functions from stellar-base
export * from "stellar-base";

export { version };

export default module.exports;
