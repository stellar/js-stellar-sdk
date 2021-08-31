import { Asset } from "stellar-base";

import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link LiquidityPoolCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#liquidityPools}.
 *
 * @class LiquidityPoolCallBuilder
 * @extends CallBuilder
 * @constructor
 * @param {string} serverUrl Horizon server URL.
 */
export class LiquidityPoolCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.LiquidityPoolRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("liquidity_pools");
  }

  /**
   * Filters out liquidity pools whose reserves aren't in this list of assets.
   *
   * @see Asset
   * @param {Asset[]} assets
   * @returns {LiquidityPoolCallBuilder} current LiquidityPoolCallBuilder instance
   */
  public forAssets(...assets: Asset[]): this {
    const assetList: string = assets
      .map((asset: Asset) => asset.toString())
      .join(",");
    this.url.setQuery("reserves", assetList);
    return this;
  }

  /**
   * Retrieves a specific liquidity pool by ID.
   *
   * @param  {string} id
   * @returns {CallBuilder} a new CallBuilder instance for the /liquidity_pools/:id endpoint
   */
  public liquidityPoolId(
    id: string,
  ): CallBuilder<ServerApi.LiquidityPoolRecord> {
    if (!id.match(/[a-fA-F0-9]{64}/)) {
      throw new TypeError(`${id} does not look like a liquidity pool ID`);
    }

    const builder = new CallBuilder<ServerApi.LiquidityPoolRecord>(
      this.url.clone(),
    );
    builder.filter.push([id.toLowerCase()]);
    return builder;
  }
}
