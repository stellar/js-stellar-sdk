import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link TransactionCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#transactions}.
 *
 * @class TransactionCallBuilder
 * @extends CallBuilder
 * @see [All Transactions](https://www.stellar.org/developers/horizon/reference/endpoints/transactions-all.html)
 * @constructor
 * @param {string} serverUrl Horizon server URL.
 */
export class TransactionCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.TransactionRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("transactions");
  }

  /**
   * The transaction details endpoint provides information on a single transaction. The transaction hash provided in the hash argument specifies which transaction to load.
   * @see [Transaction Details](https://www.stellar.org/developers/horizon/reference/endpoints/transactions-single.html)
   * @param {string} transactionId Transaction ID
   * @returns {CallBuilder} a CallBuilder instance
   */
  public transaction(
    transactionId: string,
  ): CallBuilder<ServerApi.TransactionRecord> {
    const builder = new CallBuilder<ServerApi.TransactionRecord>(
      this.url.clone(),
    );
    builder.filter.push([transactionId]);
    return builder;
  }

  /**
   * This endpoint represents all transactions that affected a given account.
   * @see [Transactions for Account](https://www.stellar.org/developers/horizon/reference/endpoints/transactions-for-account.html)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
   */
  public forAccount(accountId: string): this {
    this.filter.push(["accounts", accountId, "transactions"]);
    return this;
  }

  /**
   * This endpoint represents all transactions that reference a given claimable_balance.
   * @see [Operations for Claimable Balance](https://www.stellar.org/developers/horizon/reference/endpoints/transactions-for-claimable-balance.html)
   * @param {string} claimableBalanceId Claimable Balance ID
   * @returns {TransactionCallBuilder} this TransactionCallBuilder instance
   */
  public forClaimableBalance(claimableBalanceId: string): this {
    this.filter.push(["claimable_balances", claimableBalanceId, "transactions"]);
    return this;
  }

  /**
   * This endpoint represents all transactions in a given ledger.
   * @see [Transactions for Ledger](https://www.stellar.org/developers/horizon/reference/endpoints/transactions-for-ledger.html)
   * @param {number|string} sequence Ledger sequence
   * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
   */
  public forLedger(sequence: number | string): this {
    const ledgerSequence =
      typeof sequence === "number" ? sequence.toString() : sequence;

    this.filter.push(["ledgers", ledgerSequence, "transactions"]);
    return this;
  }

  /**
   * Adds a parameter defining whether to include failed transactions. By default only successful transactions are
   * returned.
   * @param {bool} value Set to `true` to include failed transactions.
   * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
   */
  public includeFailed(value: boolean): this {
    this.url.setQuery("include_failed", value.toString());
    return this;
  }
}
