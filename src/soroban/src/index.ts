// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

/* tslint:disable:no-var-requires */
require("es6-promise").polyfill();
const version = require("../package.json").version;

// Expose all types
export * from "./soroban_rpc";

// stellar-sdk classes to expose
export { Server } from "./server";
export {
  default as AxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime,
} from "./axios";
export * from "./transaction";

// expose classes and functions from stellar-base
export * from "stellar-base";

export { version };

export default module.exports;
