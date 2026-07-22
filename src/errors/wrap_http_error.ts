import { NetworkError } from "./network.js";

/**
 * Normalizes a rejection from the HTTP client into an SDK error. HTTP-level
 * failures from the http client are Error instances carrying a `.response`,
 * so an instanceof check alone would leak them through raw.
 *
 * If the rejection carries an HTTP response (directly or via `.response`),
 * `wrap` is called with the normalized response details to build the SDK
 * error, and the original error is kept reachable via `cause`. Otherwise the
 * original error is returned as-is (coerced to an `Error` if needed).
 *
 * @param error - The rejection value from the HTTP client.
 * @param wrap - Builds the SDK error from the normalized response details.
 * @returns The SDK error, or the original error if it was not HTTP-level.
 */
export function wrapHttpError(
  error: any,
  wrap: (details: {
    data: any;
    status: number;
    statusText: string;
  }) => NetworkError,
): Error {
  const response = error?.response ?? error;
  if (response && typeof response.status === "number") {
    const wrapped = wrap({
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    });
    // keep the underlying http client error (headers, config, etc.) reachable
    if (error instanceof Error) {
      wrapped.cause = error;
    }
    return wrapped;
  }
  return error instanceof Error ? error : new Error(String(error));
}
