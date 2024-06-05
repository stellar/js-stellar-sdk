/** @module Horizon */

// Expose all types
export * from "./horizon_api";
export * from "./server_api";

// stellar-sdk classes to expose
export * from "./account_response";

export { Server } from "./server";
export {
  default as AxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime
} from "./horizon_axios_client";

export default module.exports;
