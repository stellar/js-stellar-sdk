import { Asset } from "../base/index.js";
import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link TradesCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server#trades}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/trades|Trades}
 *
 * @internal
 *
 * @param {string} serverUrl serverUrl Horizon server URL.
 */
export class TradesCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.TradeRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient, "trades");
    this.setPath("trades");
  }

  /**
   * Filter trades for a specific asset pair (orderbook)
   * @param {Asset} base asset
   * @param {Asset} counter asset
   * @returns {TradesCallBuilder} current TradesCallBuilder instance
   */
  public forAssetPair(base: Asset, counter: Asset): this {
    const baseIssuer = base.getIssuer();
    if (!base.isNative() && baseIssuer !== undefined) {
      this.url.searchParams.set("base_asset_type", base.getAssetType());
      this.url.searchParams.set("base_asset_code", base.getCode());
      this.url.searchParams.set("base_asset_issuer", baseIssuer);
    } else {
      this.url.searchParams.set("base_asset_type", "native");
    }
    const counterIssuer = counter.getIssuer();
    if (!counter.isNative() && counterIssuer !== undefined) {
      this.url.searchParams.set("counter_asset_type", counter.getAssetType());
      this.url.searchParams.set("counter_asset_code", counter.getCode());
      this.url.searchParams.set("counter_asset_issuer", counterIssuer);
    } else {
      this.url.searchParams.set("counter_asset_type", "native");
    }
    return this;
  }

  /**
   * Filter trades for a specific offer
   * @param {string} offerId ID of the offer
   * @returns {TradesCallBuilder} current TradesCallBuilder instance
   */
  public forOffer(offerId: string): this {
    this.url.searchParams.set("offer_id", offerId);
    return this;
  }

  /**
   * Filter trades by a specific type.
   * @param {ServerApi.TradeType} tradeType the trade type to filter by.
   * @returns {TradesCallBuilder} current TradesCallBuilder instance.
   */
  public forType(tradeType: ServerApi.TradeType): this {
    this.url.searchParams.set("trade_type", tradeType);
    return this;
  }

  /**
   * Filter trades for a specific account
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/get-trades-by-account-id|Trades for Account}
   * @param {string} accountId For example: `GBYTR4MC5JAX4ALGUBJD7EIKZVM7CUGWKXIUJMRSMK573XH2O7VAK3SR`
   * @returns {TradesCallBuilder} current TradesCallBuilder instance
   */
  public forAccount(accountId: string): this {
    return this.forEndpoint("accounts", accountId);
  }

  /**
   * Filter trades for a specific liquidity pool
   * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/retrieve-related-trades|Trades for Liquidity Pool}
   * @param {string} liquidityPoolId For example: `3b476aff8a406a6ec3b61d5c038009cef85f2ddfaf616822dc4fec92845149b4`
   * @returns {TradesCallBuilder} current TradesCallBuilder instance
   */
  public forLiquidityPool(liquidityPoolId: string): this {
    return this.forEndpoint("liquidity_pools", liquidityPoolId);
  }
}
