import {CallBuilder} from "./call_builder";

export class OrderbookCallBuilder extends CallBuilder {
    /**
     * Creates a new {@link OrderbookCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#orderbook}.
     * @see [Orderbook Details](https://www.stellar.org/developers/horizon/reference/orderbook-details.html)
     * @param {string} serverUrl serverUrl Horizon server URL.
     * @param {Asset} selling Asset being sold
     * @param {Asset} buying Asset being bought
     */
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

    /**
     * People on the Stellar network can make offers to buy or sell assets. These offers are summarized by the assets being bought and sold in orderbooks. When an offer is fully or partially fulfilled, a trade happens.
     * @see [Trades for Orderbook](https://www.stellar.org/developers/horizon/reference/trades-for-orderbook.html)
     * @returns {OrderbookCallBuilder}
     */
    trades() {
        this.filter.push(['order_book', 'trades']);
        return this;
    }
}

