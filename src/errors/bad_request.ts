import { NetworkError } from "./network.js";

/**
 * BadRequestError is raised when a request made to Horizon is invalid in some
 * way (incorrect timebounds for trade call builders, for example.)
 *
 * @param message - Human-readable error message
 * @param response - Response details, received from the Horizon server
 */
export class BadRequestError extends NetworkError {}
