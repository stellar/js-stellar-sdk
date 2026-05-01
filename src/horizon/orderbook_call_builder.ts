import { Asset } from "../base/index.js";
import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link OrderbookCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server#orderbook}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/aggregations/order-books|Orderbook Details}
 *
 * @augments CallBuilder
 * @private
 * @class
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} selling Asset being sold
 * @param {Asset} buying Asset being bought
 */
export class OrderbookCallBuilder extends CallBuilder<ServerApi.OrderbookRecord> {
  constructor(
    serverUrl: URL,
    httpClient: HttpClient,
    selling: Asset,
    buying: Asset,
  ) {
    super(serverUrl, httpClient);
    this.setPath("order_book");
    const sellingIssuer = selling.getIssuer();
    if (!selling.isNative() && sellingIssuer !== undefined) {
      this.url.searchParams.set("selling_asset_type", selling.getAssetType());
      this.url.searchParams.set("selling_asset_code", selling.getCode());
      this.url.searchParams.set("selling_asset_issuer", sellingIssuer);
    } else {
      this.url.searchParams.set("selling_asset_type", "native");
    }
    const buyingIssuer = buying.getIssuer();
    if (!buying.isNative() && buyingIssuer !== undefined) {
      this.url.searchParams.set("buying_asset_type", buying.getAssetType());
      this.url.searchParams.set("buying_asset_code", buying.getCode());
      this.url.searchParams.set("buying_asset_issuer", buyingIssuer);
    } else {
      this.url.searchParams.set("buying_asset_type", "native");
    }
  }
}
