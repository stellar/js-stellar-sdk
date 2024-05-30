import { Asset } from "@stellar/stellar-base";
import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link ClaimableBalanceCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#claimableBalances}.
 * @see [Claimable Balances](https://developers.stellar.org/api/resources/claimablebalances/)
 * @class ClaimableBalanceCallBuilder
 * @class
 * @augments CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class ClaimableBalanceCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.ClaimableBalanceRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("claimable_balances");
  }

  /**
   * The claimable balance details endpoint provides information on a single claimable balance.
   * @see [Claimable Balance Details](https://developers.stellar.org/api/resources/claimablebalances/single/)
   * @param {string} claimableBalanceId Claimable balance ID
   * @returns {CallBuilder<ServerApi.ClaimableBalanceRecord>} CallBuilder<ServerApi.ClaimableBalanceRecord> OperationCallBuilder instance
   */
  public claimableBalance(
    claimableBalanceId: string,
  ): CallBuilder<ServerApi.ClaimableBalanceRecord> {
    const builder = new CallBuilder<ServerApi.ClaimableBalanceRecord>(
      this.url.clone(),
    );
    builder.filter.push([claimableBalanceId]);
    return builder;
  }

  /**
   * Returns all claimable balances which are sponsored by the given account ID.
   * @see [Claimable Balances](https://developers.stellar.org/api/resources/claimablebalances/list/)
   * @param {string} sponsor For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {ClaimableBalanceCallBuilder} current ClaimableBalanceCallBuilder instance
   */
  public sponsor(sponsor: string): this {
    this.url.setQuery("sponsor", sponsor);
    return this;
  }

  /**
   * Returns all claimable balances which can be claimed by the given account ID.
   * @see [Claimable Balances](https://developers.stellar.org/api/resources/claimablebalances/list/)
   * @param {string} claimant For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {ClaimableBalanceCallBuilder} current ClaimableBalanceCallBuilder instance
   */
  public claimant(claimant: string): this {
    this.url.setQuery("claimant", claimant);
    return this;
  }

  /**
   * Returns all claimable balances which provide a balance for the given asset.
   * @see [Claimable Balances](https://developers.stellar.org/api/resources/claimablebalances/list/)
   * @param asset
   * @param {Asset} The Asset held by the claimable balance
   * @returns {ClaimableBalanceCallBuilder} current ClaimableBalanceCallBuilder instance
   */
  public asset(asset: Asset): this {
    this.url.setQuery("asset", asset.toString());
    return this;
  }
}
