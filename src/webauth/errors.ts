/** @memberof module:WebAuth */
export class InvalidChallengeError extends Error {
    public __proto__: InvalidChallengeError;

    /**
     * Create an InvalidChallengeError
     * @param {string} message error message
     */
    constructor(message: string) {
      const trueProto = new.target.prototype;
      super(message);
      this.__proto__ = trueProto;
      this.constructor = InvalidChallengeError;
      this.name = "InvalidChallengeError";
    }
  }
