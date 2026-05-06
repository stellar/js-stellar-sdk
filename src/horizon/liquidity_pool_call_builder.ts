import { Asset } from "../base/index.js";

import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link LiquidityPoolCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server.liquidityPools}.
 *
 * @internal
 * @param serverUrl Horizon server URL.
 * @category Network / Horizon
 */
export class LiquidityPoolCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.LiquidityPoolRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient);
    this.setPath("liquidity_pools");
  }

  /**
   * Filters out pools whose reserves don't exactly match these assets.
   *
   * @see Asset
   * @returns current LiquidityPoolCallBuilder instance
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
   * @param id   the participant account to filter by
   * @returns current LiquidityPoolCallBuilder instance
   */
  public forAccount(id: string): this {
    this.url.searchParams.set("account", id);
    return this;
  }

  /**
   * Retrieves a specific liquidity pool by ID.
   *
   * @param id   the hash/ID of the liquidity pool
   * @returns a new CallBuilder instance for the /liquidity_pools/:id endpoint
   */
  public liquidityPoolId(
    id: string,
  ): CallBuilder<ServerApi.LiquidityPoolRecord> {
    if (!id.match(/[a-fA-F0-9]{64}/)) {
      throw new TypeError(`${id} does not look like a liquidity pool ID`);
    }

    const builder = new CallBuilder<ServerApi.LiquidityPoolRecord>(
      new URL(this.url),
      this.httpClient,
    );
    builder.filter.push([id.toLowerCase()]);
    return builder;
  }
}
