/* eslint-disable max-classes-per-file */
import { HorizonApi } from "./horizon/horizon_api";

// For ES5 compatibility (https://stackoverflow.com/a/55066280).
/* tslint:disable:variable-name max-classes-per-file */


export class NetworkError extends Error {
  public response: {
    data?: HorizonApi.ErrorResponseData;
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

/**
 * AccountRequiresMemoError is raised when a transaction is trying to submit an
 * operation to an account which requires a memo. See
 * [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md)
 * for more information.
 *
 * This error contains two attributes to help you identify the account requiring
 * the memo and the operation where the account is the destination
 *
 * ```
 * console.log('The following account requires a memo ', err.accountId)
 * console.log('The account is used in operation: ', err.operationIndex)
 * ```
 *
 */
export class AccountRequiresMemoError extends Error {
  public __proto__: AccountRequiresMemoError;

  /**
   * accountId account which requires a memo.
   */
  public accountId: string;

  /**
   * operationIndex operation where accountId is the destination.
   */
  public operationIndex: number;

  /**
   * Create an AccountRequiresMemoError
   * @param {message} message - error message
   * @param {string} accountId - The account which requires a memo.
   * @param {number} operationIndex - The index of the operation where `accountId` is the destination.
   */
  constructor(message: string, accountId: string, operationIndex: number) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = AccountRequiresMemoError;
    this.name = "AccountRequiresMemoError";
    this.accountId = accountId;
    this.operationIndex = operationIndex;
  }
}
