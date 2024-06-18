/**
 * AccountRequiresMemoError is raised when a transaction is trying to submit an
 * operation to an account which requires a memo. See
 * [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md)
 * for more information.
 *
 * This error contains two attributes to help you identify the account requiring
 * the memo and the operation where the account is the destination
 * @category Errors
 *
 * @param {string} message Human-readable error message
 * @param {string} accountId The account which requires a memo
 * @param {number} operationIndex The index of the operation where `accountId` is the destination
 *
 * @example
 * console.log('The following account requires a memo ', err.accountId)
 * console.log('The account is used in operation: ', err.operationIndex)
 */
export class AccountRequiresMemoError extends Error {
  public __proto__: AccountRequiresMemoError;
  public accountId: string;
  public operationIndex: number;

  constructor(message: string, accountId: string, operationIndex: number) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = AccountRequiresMemoError;
    this.name = "AccountRequiresMemoError";

    /**
     * The account which requires a memo.
     * @type {string}
     */
    this.accountId = accountId;
    /**
     * Operation where accountId is the destination.
     * @type {number}
     */
    this.operationIndex = operationIndex;
  }
}
