import { Asset } from "../base/index.js";
import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link ClaimableBalanceCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server.claimableBalances}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/claimablebalances | Claimable Balances}
 *
 * @internal
 * @param serverUrl Horizon server URL.
 */
export class ClaimableBalanceCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.ClaimableBalanceRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient);
    this.setPath("claimable_balances");
  }

  /**
   * The claimable balance details endpoint provides information on a single claimable balance.
   *
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/retrieve-a-claimable-balance | Claimable Balance Details}
   * @param claimableBalanceId Claimable balance ID
   * @returns CallBuilder<ServerApi.ClaimableBalanceRecord> OperationCallBuilder instance
   */
  public claimableBalance(
    claimableBalanceId: string,
  ): CallBuilder<ServerApi.ClaimableBalanceRecord> {
    const builder = new CallBuilder<ServerApi.ClaimableBalanceRecord>(
      new URL(this.url),
      this.httpClient,
    );
    builder.filter.push([claimableBalanceId]);
    return builder;
  }

  /**
   * Returns all claimable balances which are sponsored by the given account ID.
   *
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/list-all-claimable-balances | Claimable Balances}
   * @param sponsor For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns current ClaimableBalanceCallBuilder instance
   */
  public sponsor(sponsor: string): this {
    this.url.searchParams.set("sponsor", sponsor);
    return this;
  }

  /**
   * Returns all claimable balances which can be claimed by the given account ID.
   *
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/list-all-claimable-balances | Claimable Balances}
   * @param claimant For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns current ClaimableBalanceCallBuilder instance
   */
  public claimant(claimant: string): this {
    this.url.searchParams.set("claimant", claimant);
    return this;
  }

  /**
   * Returns all claimable balances which provide a balance for the given asset.
   *
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/list-all-claimable-balances | Claimable Balances}
   * @param asset The Asset held by the claimable balance
   * @returns current ClaimableBalanceCallBuilder instance
   */
  public asset(asset: Asset): this {
    this.url.searchParams.set("asset", asset.toString());
    return this;
  }
}
