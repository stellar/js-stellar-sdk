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
   * This endpoint filters all liquidity pools which contain reserves
   * corresponding to any of the provided assets.
   *
   * @see Asset
   * @returns {LiquidityPoolCallBuilder} current LiquidityPoolCallBuilder instance
   */
  public forAssets(...assets: Asset[]) {
    const commaSeparatedAssets: string = assets
      .map((asset: Asset) => {
        return asset.toString();
      })
      .join(",");
    this.url.setQuery("reserves", commaSeparatedAssets);
    return this;
  }
}
