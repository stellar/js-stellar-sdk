// A cross-origin redirect hop keeps only these headers. An allowlist also catches credential headers the SDK cannot name, such as a provider API key in `opts.headers`.
const SAFE_CROSS_ORIGIN_HEADERS = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "content-type",
  "content-length",
  "content-encoding",
  "content-language",
  "content-location",
  "content-range",
  "user-agent",
  "range",
  "if-range",
  "if-match",
  "if-none-match",
  "if-modified-since",
  "if-unmodified-since",
  "cache-control",
  "pragma",
  "x-client-name",
  "x-client-version",
  "x-app-name",
  "x-app-version",
]);

export function isSafeCrossOriginHeader(name: string): boolean {
  return SAFE_CROSS_ORIGIN_HEADERS.has(name.toLowerCase());
}
