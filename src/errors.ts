import { Horizon } from "./horizon_api";

// For ES5 compatibility (https://stackoverflow.com/a/55066280).
/* tslint:disable:variable-name max-classes-per-file */

export class NetworkError extends Error {
  public response: {
    data?: Horizon.ErrorResponseData;
    status?: number;
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
  }
}

export class BadRequestError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadRequestError;
  }
}

export class BadResponseError extends NetworkError {
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message, response);
    this.__proto__ = trueProto;
    this.constructor = BadResponseError;
  }
}
