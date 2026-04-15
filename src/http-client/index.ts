import { HttpClient, HttpClientRequestConfig } from "./types";
import * as axiosModule from "./axios-client";
import * as fetchModule from "./fetch-client";

let httpClient: HttpClient;
let create: (config?: HttpClientRequestConfig) => HttpClient;

// Injected at build time by rollup/esbuild (`define`). Build variants without
// axios substitute `false`, and dead-code elimination drops the other branch
// (and the now-unreferenced transport module).
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __USE_AXIOS__: boolean;

if (__USE_AXIOS__) {
  httpClient = axiosModule.axiosClient as unknown as HttpClient;
  create = axiosModule.create as unknown as typeof create;
} else {
  httpClient = fetchModule.fetchClient;
  create = fetchModule.create;
}

export { httpClient, create };
export * from "./types";
