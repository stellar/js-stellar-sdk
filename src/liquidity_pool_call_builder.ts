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
    this.segment("liquidity_pools");
  }

  /**
   * Filters out pools whose reserves don't exactly match these assets.
   *
   * @see Asset
   * @param {Asset[]} assets
   * @returns {LiquidityPoolCallBuilder} current LiquidityPoolCallBuilder instance
   */
  public forAssets(...assets: Asset[]): this {
    const assetList: string = assets
      .map((asset: Asset) => asset.toString())
      .join(",");
    this.url.searchParams.set("reserves", assetList);
    return this;
  }

  /**
   * Retrieves all pools an account is participating in.
   *
   * @param {string} id   the participant account to filter by
   * @returns {LiquidityPoolCallBuilder} current LiquidityPoolCallBuilder instance
   */
  public forAccount(id: string): this {
    this.url.searchParams.set("account", id);
    return this;
  }

  /**
   * Retrieves a specific liquidity pool by ID.
   *
   * @param {string} id   the hash/ID of the liquidity pool
   * @returns {CallBuilder} a new CallBuilder instance for the /liquidity_pools/:id endpoint
   */
  public liquidityPoolId(
    id: string,
  ): CallBuilder<ServerApi.LiquidityPoolRecord> {
    if (!id.match(/[a-fA-F0-9]{64}/)) {
      throw new TypeError(`${id} does not look like a liquidity pool ID`);
    }

    const builder = new CallBuilder<ServerApi.LiquidityPoolRecord>(
      this.clone(),
    );
    builder.filter.push([id.toLowerCase()]);
    return builder;
  }
}
