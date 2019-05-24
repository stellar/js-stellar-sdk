// For ES5 compatibility (https://stackoverflow.com/a/55066280).
/* eslint-disable no-proto */

export class NetworkError extends Error {
  public response: any;
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
