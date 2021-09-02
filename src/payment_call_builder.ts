import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link PaymentCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#payments}.
 * @see [All Payments](https://www.stellar.org/developers/horizon/reference/endpoints/payments-all.html)
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class PaymentCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.PaymentOperationRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl, "payments");
    this.url.segment("payments");
  }

  /**
   * This endpoint responds with a collection of Payment operations where the given account was either the sender or receiver.
   * @see [Payments for Account](https://www.stellar.org/developers/horizon/reference/endpoints/payments-for-account.html)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forAccount(accountId: string): this {
    return this.forEndpoint("accounts", accountId);
  }

  /**
   * This endpoint represents all payment operations that are part of a valid transactions in a given ledger.
   * @see [Payments for Ledger](https://www.stellar.org/developers/horizon/reference/endpoints/payments-for-ledger.html)
   * @param {number|string} sequence Ledger sequence
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forLedger(sequence: number | string): this {
    return this.forEndpoint("ledgers", sequence.toString());
  }

  /**
   * This endpoint represents all payment operations that are part of a given transaction.
   * @see [Payments for Transaction](https://www.stellar.org/developers/horizon/reference/endpoints/payments-for-transaction.html)
   * @param {string} transactionId Transaction ID
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forTransaction(transactionId: string): this {
    return this.forEndpoint("transactions", transactionId);
  }
}
