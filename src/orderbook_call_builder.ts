import { Asset } from 'stellar-base';
import { CallBuilder } from './call_builder';
import { ServerApi } from './server_api';

/**
 * Creates a new {@link OrderbookCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#orderbook}.
 * @see [Orderbook Details](https://developers.stellar.org/api/aggregations/order-books/)
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} selling Asset being sold
 * @param {Asset} buying Asset being bought
 */
export class OrderbookCallBuilder extends CallBuilder<ServerApi.OrderbookRecord> {
  constructor(serverUrl: URI, selling: Asset, buying: Asset) {
    super(serverUrl);
    this.url.segment('order_book');
    if (!selling.isNative()) {
      this.url.setQuery('selling_asset_type', selling.getAssetType());
      this.url.setQuery('selling_asset_code', selling.getCode());
      this.url.setQuery('selling_asset_issuer', selling.getIssuer());
    } else {
      this.url.setQuery('selling_asset_type', 'native');
    }
    if (!buying.isNative()) {
      this.url.setQuery('buying_asset_type', buying.getAssetType());
      this.url.setQuery('buying_asset_code', buying.getCode());
      this.url.setQuery('buying_asset_issuer', buying.getIssuer());
    } else {
      this.url.setQuery('buying_asset_type', 'native');
    }
  }
}
