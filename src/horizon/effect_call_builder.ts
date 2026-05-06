import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link EffectCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Horizon.Server.effects}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/effects | All Effects}
 *
 * @internal
 * @param serverUrl Horizon server URL.
 */
export class EffectCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.EffectRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient, "effects");
    this.setPath("effects");
  }

  /**
   * This endpoint represents all effects that changed a given account. It will return relevant effects from the creation of the account to the current ledger.
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/get-effects-by-account-id | Effects for Account}
   * @param accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns this EffectCallBuilder instance
   */
  public forAccount(accountId: string): this {
    return this.forEndpoint("accounts", accountId);
  }

  /**
   * Effects are the specific ways that the ledger was changed by any operation.
   *
   * This endpoint represents all effects that occurred in the given ledger.
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/retrieve-a-ledgers-effects | Effects for Ledger}
   * @param sequence Ledger sequence
   * @returns this EffectCallBuilder instance
   */
  public forLedger(sequence: number | string): this {
    return this.forEndpoint("ledgers", sequence.toString());
  }

  /**
   * This endpoint represents all effects that occurred as a result of a given transaction.
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/retrieve-a-transactions-effects | Effects for Transaction}
   * @param transactionId Transaction ID
   * @returns this EffectCallBuilder instance
   */
  public forTransaction(transactionId: string): this {
    return this.forEndpoint("transactions", transactionId);
  }

  /**
   * This endpoint represents all effects that occurred as a result of a given operation.
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/retrieve-an-operations-effects | Effects for Operation}
   * @param operationId Operation ID
   * @returns this EffectCallBuilder instance
   */
  public forOperation(operationId: string): this {
    return this.forEndpoint("operations", operationId);
  }

  /**
   * This endpoint represents all effects involving a particular liquidity pool.
   *
   * @param poolId   liquidity pool ID
   * @returns this EffectCallBuilder instance
   */
  public forLiquidityPool(poolId: string): this {
    return this.forEndpoint("liquidity_pools", poolId);
  }
}
