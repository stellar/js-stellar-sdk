// The `axios` HTTP client implementation for the Stellar SDK. This module re-exports the SDK's built-in HTTP client,
//  but with the `axios` implementation. This allows users to
// inject the `axios` client without switching bundles (e.g. from `stellar-sdk/axios` to
// `stellar-sdk`).
export { axiosClient as httpClient, create } from "./axios-client";
export * from "./types";
