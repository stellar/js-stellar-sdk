// tslint:disable-next-line: no-reference
/// <reference path="../../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from "./soroban_rpc";

// stellar-sdk classes to expose
export { Server as SorobanClient } from "./server";
export { default as AxiosClient } from "./axios";
export * from "./transaction";

export default module.exports;
