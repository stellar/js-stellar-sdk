import { HttpClient, HttpClientRequestConfig } from "./types";

let httpClient: HttpClient;

let create: (config?: HttpClientRequestConfig) => HttpClient;

// Declare a variable that will be set by the entrypoint
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __USE_AXIOS__: boolean;

// Use the variable for the runtime check

if (__USE_AXIOS__) {
  const axiosModule = require("./axios-client");
  httpClient = axiosModule.axiosClient;
  create = axiosModule.create;
} else {
  const fetchModule = require("./fetch-client");
  httpClient = fetchModule.fetchClient;
  create = fetchModule.create;
}

export { httpClient, create };
export * from "./types";
