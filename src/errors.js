export class NetworkError extends Error {
  constructor(message, response) {
    super(message);
    this.constructor = NetworkError;
    this.response = response;
  }

  getResponse() {
    return this.response;
  }
}

export class NotFoundError extends NetworkError {
  constructor(message, response) {
    super(message, response);
    this.constructor = NotFoundError;
  }
}

export class BadRequestError extends NetworkError {
  constructor(message, response) {
    super(message, response);
    this.constructor = BadRequestError;
  }
}

export class BadResponseError extends NetworkError {
  constructor(message, response) {
    super(message, response);
    this.constructor = BadResponseError;
  }
}
