import { create, type HttpClient } from "../http-client/index.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __PACKAGE_VERSION__: string;
export const version = __PACKAGE_VERSION__;

export function createHttpClient(headers?: Record<string, string>): HttpClient {
  return create({
    headers: {
      ...headers,
      "X-Client-Name": "js-stellar-sdk",
      "X-Client-Version": version,
    },
  });
}
