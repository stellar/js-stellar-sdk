import { CallBuilder } from './call_builder';

/**
 * Creates a new {@link OperationCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#operations}.
 *
 * @see [All Operations](https://www.stellar.org/developers/horizon/reference/operations-all.html)
 * @class OperationCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class OperationCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl);
    this.url.segment('operations');
  }

  /**
   * The operation details endpoint provides information on a single operation. The operation ID provided in the id
   * argument specifies which operation to load.
   * @see [Operation Details](https://www.stellar.org/developers/horizon/reference/operations-single.html)
   * @param {number} operationId Operation ID
   * @returns {OperationCallBuilder} this OperationCallBuilder instance
   */
  operation(operationId) {
    this.filter.push(['operations', operationId]);
    return this;
  }

  /**
   * This endpoint represents all operations that were included in valid transactions that affected a particular account.
   * @see [Operations for Account](https://www.stellar.org/developers/horizon/reference/operations-for-account.html)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {OperationCallBuilder} this OperationCallBuilder instance
   */
  forAccount(accountId) {
    this.filter.push(['accounts', accountId, 'operations']);
    return this;
  }

  /**
   * This endpoint returns all operations that occurred in a given ledger.
   *
   * @see [Operations for Ledger](https://www.stellar.org/developers/horizon/reference/operations-for-ledger.html)
   * @param {number|string} sequence Ledger sequence
   * @returns {OperationCallBuilder} this OperationCallBuilder instance
   */
  forLedger(sequence) {
    this.filter.push([
      'ledgers',
      typeof sequence === 'number' ? sequence.toString() : sequence,
      'operations'
    ]);
    return this;
  }

  /**
   * This endpoint represents all operations that are part of a given transaction.
   * @see [Operations for Transaction](https://www.stellar.org/developers/horizon/reference/operations-for-transaction.html)
   * @param {string} transactionId Transaction ID
   * @returns {OperationCallBuilder} this OperationCallBuilder instance
   */
  forTransaction(transactionId) {
    this.filter.push(['transactions', transactionId, 'operations']);
    return this;
  }

  /**
   * Adds a parameter defining whether to include failed transactions. By default only operations of
   * successful transactions are returned.
   * @param {bool} value Set to `true` to include operations of failed transactions.
   * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
   */
  includeFailed(value) {
    this.url.setQuery('include_failed', value.toString());
    return this;
  }
}
