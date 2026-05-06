import { NetworkError } from "./network.js";

/**
 * BadResponseError is raised when a response from a
 * {@link Horizon | Horizon} or {@link Federation | Federation}
 * server is invalid in some way. For example, a federation response may exceed
 * the maximum allowed size, or a transaction submission may have failed with
 * Horizon.
 * @category Errors
 *
 * @param message Human-readable error message.
 * @param response Response details, received from the server.
 */
export class BadResponseError extends NetworkError {}
