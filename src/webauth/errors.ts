/**
 * InvalidChallengeError is raised when a challenge transaction does not meet
 * the requirements for a SEP-10 challenge transaction (for example, a non-zero
 * sequence number).
 * @memberof module:WebAuth
 * @category Errors
 *
 * @param {string} message Human-readable error message.
 */
export class InvalidChallengeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidChallengeError";
    Object.setPrototypeOf(this, InvalidChallengeError.prototype);
  }
}
