import { create, HttpClient } from "../http-client";

// eslint-disable-next-line prefer-import/prefer-import-over-require, global-require, @typescript-eslint/naming-convention
declare const __PACKAGE_VERSION__: string;
export const version = __PACKAGE_VERSION__;

export function createHttpClient(headers?: Record<string, string>): HttpClient {
  return create({
    headers: {
      ...headers,
      "X-Client-Name": "js-soroban-client",
      "X-Client-Version": version,
    },
  });
}
