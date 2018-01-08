import { CallBuilder } from './call_builder';

/**
 * @class EffectCallBuilder
 * @extends CallBuilder
 */
export class EffectCallBuilder extends CallBuilder {
  /*
     * Creates a new {@link EffectCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#effects}.
     * @see [All Effects](https://www.stellar.org/developers/horizon/reference/effects-all.html)
     * @constructor
     * @param {string} serverUrl Horizon server URL.
     */
  constructor(serverUrl) {
    super(serverUrl);
    this.url.segment('effects');
  }

  /**
     * This endpoint represents all effects that changed a given account. It will return relevant effects from the creation of the account to the current ledger.
     * @see [Effects for Account](https://www.stellar.org/developers/horizon/reference/effects-for-account.html)
     * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {EffectCallBuilder}
     */
  forAccount(accountId) {
    this.filter.push(['accounts', accountId, 'effects']);
    return this;
  }

  /**
     * Effects are the specific ways that the ledger was changed by any operation.
     *
     * This endpoint represents all effects that occurred in the given ledger.
     * @see [Effects for Ledger](https://www.stellar.org/developers/horizon/reference/effects-for-ledger.html)
     * @param {number|string} sequence Ledger sequence
     * @returns {EffectCallBuilder}
     */
  forLedger(sequence) {
    let sequenceString = sequence;
    if (typeof sequence === 'number') {
      sequenceString = sequence.toString();
    }
    this.filter.push(['ledgers', sequenceString, 'effects']);
    return this;
  }

  /**
     * This endpoint represents all effects that occurred as a result of a given transaction.
     * @see [Effects for Transaction](https://www.stellar.org/developers/horizon/reference/effects-for-transaction.html)
     * @param {string} transactionId Transaction ID
     * @returns {EffectCallBuilder}
     */
  forTransaction(transactionId) {
    this.filter.push(['transactions', transactionId, 'effects']);
    return this;
  }

  /**
     * This endpoint represents all effects that occurred as a result of a given operation.
     * @see [Effects for Operation](https://www.stellar.org/developers/horizon/reference/effects-for-operation.html)
     * @param {number} operationId Operation ID
     * @returns {EffectCallBuilder}
     */
  forOperation(operationId) {
    this.filter.push(['operations', operationId, 'effects']);
    return this;
  }
}
