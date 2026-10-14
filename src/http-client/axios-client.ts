import axios from "axios";
import { isSafeCrossOriginHeader } from "./redirect-headers.js";

// Axios sets these for the next hop just before this hook runs: its proxy hook writes a fresh `Proxy-Authorization` and `host`, after it and `follow-redirects` drop the old ones.
const AXIOS_HOP_HEADERS = new Set(["host", "proxy-authorization"]);

// An unparsable URL counts as cross-origin.
function isSameOrigin(href: unknown, url: string): boolean {
  if (typeof href !== "string") return false;
  try {
    return new URL(href).origin === new URL(url).origin;
  } catch {
    return false;
  }
}

// Axios calls this in Node before each redirect hop.
function stripCrossOriginHeaders(
  options: Record<string, unknown>,
  _response: unknown,
  request: { url: string },
): void {
  const { href, headers } = options;
  if (typeof headers !== "object" || headers === null) return;
  if (isSameOrigin(href, request.url)) return;
  for (const name of Object.keys(headers)) {
    if (
      !isSafeCrossOriginHeader(name) &&
      !AXIOS_HOP_HEADERS.has(name.toLowerCase())
    ) {
      Reflect.deleteProperty(headers, name);
    }
  }
}

export const axiosClient = axios;
// A `beforeRedirect` in `config` or in a request replaces the strip.
export const create: typeof axios.create = (config) =>
  axios.create({ beforeRedirect: stripCrossOriginHeaders, ...config });
