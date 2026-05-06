import { NetworkError } from "./network.js";

/**
 * NotFoundError is raised when the resource requested from Horizon is
 * unavailable.
 * @inheritdoc
 * @category Errors
 *
 * @param {string} message Human-readable error message
 * @param {any} response Response details, received from the Horizon server
 */
export class NotFoundError extends NetworkError {}
