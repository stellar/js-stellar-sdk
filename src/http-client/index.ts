import { HttpClient, HttpClientRequestConfig } from "./types";

// eslint-disable-next-line import/no-mutable-exports
let httpClient: HttpClient;
// eslint-disable-next-line import/no-mutable-exports
let create: (config?: HttpClientRequestConfig) => HttpClient;

// Declare a variable that will be set by the entrypoint
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __USE_AXIOS__: boolean;

// Use the variable for the runtime check
// eslint-disable-next-line no-lonely-if
if (__USE_AXIOS__) {
  // eslint-disable-next-line global-require, prefer-import/prefer-import-over-require
  const axiosModule = require('./axios-client');
  httpClient = axiosModule.axiosClient;
  create = axiosModule.create;
} else {
  // eslint-disable-next-line global-require, prefer-import/prefer-import-over-require
  const fetchModule = require('./fetch-client');
  httpClient = fetchModule.fetchClient;
  create = fetchModule.create;
}

export { httpClient, create };
export * from "./types";
