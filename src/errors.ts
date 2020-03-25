import { Horizon } from "./horizon_api";

// For ES5 compatibility (https://stackoverflow.com/a/55066280).
/* tslint:disable:variable-name max-classes-per-file */

export class NetworkError extends Error {
  public response: {
    data?: Horizon.ErrorResponseData;
    status?: number;
    statusText?: string;
    url?: string;
  };
  public __proto__: NetworkError;

  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = NetworkError;
    this.response = response;
  }

  public getResponse() {
    return this.response;
  }
}

export class NotFoundError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = NotFoundError;
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadRequestError;
    this.name = "BadRequestError";
  }
}

export class BadResponseError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadResponseError;
    this.name = "BadResponseError";
  }
}

export class InvalidSep10ChallengeError extends Error {
  public __proto__: InvalidSep10ChallengeError;

  constructor(message: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = InvalidSep10ChallengeError;
    this.name = "InvalidSep10ChallengeError";
  }
}

export class AccountRequiresMemoError extends Error {
  public __proto__: AccountRequiresMemoError;

  constructor(message: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = AccountRequiresMemoError;
    this.name = "AccountRequiresMemoError";
  }
}
