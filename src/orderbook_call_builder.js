import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link OrderbookCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#orderbook}.
 * @see [Orderbook Details](https://www.stellar.org/developers/horizon/reference/orderbook-details.html)
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} selling Asset being sold
 * @param {Asset} buying Asset being bought
 */
export class OrderbookCallBuilder extends CallBuilder {
    constructor(serverUrl, selling, buying) {
        super(serverUrl);
        this.url.segment('order_book');
        if (!selling.isNative()) {
            this.url.addQuery("selling_asset_type", selling.getAssetType());
            this.url.addQuery("selling_asset_code", selling.getCode());
            this.url.addQuery("selling_asset_issuer", selling.getIssuer());
        } else {
            this.url.addQuery("selling_asset_type", 'native');
        }
        if (!buying.isNative()) {
            this.url.addQuery("buying_asset_type", buying.getAssetType());
            this.url.addQuery("buying_asset_code", buying.getCode());
            this.url.addQuery("buying_asset_issuer", buying.getIssuer());
        } else {
            this.url.addQuery("buying_asset_type", 'native');
        }
    }
}

