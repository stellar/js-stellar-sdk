// src/http-client/index.ts

import { HttpClient, HttpClientRequestConfig } from "./types";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __USE_AXIOS__: boolean;

// eslint-disable-next-line import/no-mutable-exports
let httpClient: HttpClient;
// eslint-disable-next-line import/no-mutable-exports
let create: (config?: HttpClientRequestConfig) => HttpClient;

if (__USE_AXIOS__) {
  console.log("Using Axios client");
  // eslint-disable-next-line global-require
  const axiosModule = require('./axios-client');
  httpClient = axiosModule.axiosClient;
  create = axiosModule.create;
} else {
  console.log("Using Fetch client");
  // eslint-disable-next-line global-require
  const fetchModule = require('./fetch-client');
  httpClient = fetchModule.fetchClient;
  create = fetchModule.create;
}

console.log(`Selected client type: ${httpClient.constructor.name}`);

export { httpClient, create };
export * from "./types";
