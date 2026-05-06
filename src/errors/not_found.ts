import { NetworkError } from "./network.js";

/**
 * NotFoundError is raised when the resource requested from Horizon is
 * unavailable.
 * @category Errors
 *
 * @param message Human-readable error message
 * @param response Response details, received from the Horizon server
 */
export class NotFoundError extends NetworkError {}
