import { CallBuilder } from './CallBuilder';

class LedgerCallBuilder extends CallBuilder {
  /**
     * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#ledgers}.
     * @see [All Ledgers](https://www.stellar.org/developers/horizon/reference/ledgers-all.html)
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
  constructor(serverUrl) {
    super(serverUrl);
    this.url.segment('ledgers');
  }

  /**
     * Provides information on a single ledger.
     * @param {number|string} sequence Ledger sequence
     * @returns {LedgerCallBuilder}
     */
  ledger(sequence) {
    this.filter.push(['ledgers', sequence.toString()]);
    return this;
  }
}

export { LedgerCallBuilder };
