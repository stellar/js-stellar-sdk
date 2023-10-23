
export class InvalidChallengeError extends Error {
    public __proto__: InvalidChallengeError;

    constructor(message: string) {
      const trueProto = new.target.prototype;
      super(message);
      this.__proto__ = trueProto;
      this.constructor = InvalidChallengeError;
      this.name = "InvalidChallengeError";
    }
  }