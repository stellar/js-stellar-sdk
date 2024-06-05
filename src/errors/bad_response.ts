import { NetworkError } from "./network";

/**
 * BadResponseError is raised when a response from a {@link module:Horizon} or
 * {@link module:Federation} is invalid in some way. For example, a federation
 * response may exceed the maximum allowed size, or a transaction submission may
 * have failed with Horizon.
 * @extends NetworkError
 * @inheritdoc
 */
export class BadResponseError extends NetworkError {
  /**
   * Create a BadResponseError.
   * @param {string} message Human-readable error message.
   * @param {any} response Response details, received from the Horizon server.
   */
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadResponseError;
    this.name = "BadResponseError";
  }
}
