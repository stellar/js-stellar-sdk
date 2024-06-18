import { NetworkError } from "./network";

/**
 * BadRequestError is raised when a request made to Horizon is invalid in some
 * way (incorrect timebounds for trade call builders, for example.)
 * @extends NetworkError
 * @inheritdoc
 * @category Errors
 *
 * @param {string} message Human-readable error message
 * @param {any} response Response details, received from the Horizon server
 */
export class BadRequestError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadRequestError;
    this.name = "BadRequestError";
  }
}
