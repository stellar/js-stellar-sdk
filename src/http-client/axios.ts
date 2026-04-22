// This file serves as an entry point for the axios-based HTTP client build.
// It is utilized by the build system to create a separate bundle that uses axios instead of fetch.
// By re-exporting from the main http-client index, it ensures that all types and the create function are available
// in the axios build without duplication.
export { axiosClient as httpClient, create } from "./axios-client";
export * from "./types";
