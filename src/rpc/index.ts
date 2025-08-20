/** @module rpc */

// tslint:disable-next-line: no-reference
/// <reference path="../../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from "./api";

// soroban-client classes to expose
export {
    RpcServer as Server,
    BasicSleepStrategy,
    LinearSleepStrategy,
    Durability
} from "./server";
export { default as AxiosClient } from "./axios";
export { parseRawSimulation, parseRawEvents } from "./parsers";
export * from "./transaction";

export default module.exports;
