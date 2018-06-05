import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link TradesCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#trades}.
 *
 * @class TradesCallBuilder
 * @extends CallBuilder
 * @constructor
 * @see [Trades](https://www.stellar.org/developers/horizon/reference/endpoints/trades.html)
 * @param {string} serverUrl serverUrl Horizon server URL.
 */
export class TradesCallBuilder extends CallBuilder {
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('trades');
    }

    /**
    * Filter trades for a specific asset pair (orderbook)
    * @param {Asset} base asset
    * @param {Asset} counter asset
    * @returns {TradesCallBuilder}
    */
    forAssetPair(base, counter) {
        if (!base.isNative()) {
            this.url.addQuery("base_asset_type", base.getAssetType());
            this.url.addQuery("base_asset_code", base.getCode());
            this.url.addQuery("base_asset_issuer", base.getIssuer());
        } else {
            this.url.addQuery("base_asset_type", 'native');
        }
        if (!counter.isNative()) {
            this.url.addQuery("counter_asset_type", counter.getAssetType());
            this.url.addQuery("counter_asset_code", counter.getCode());
            this.url.addQuery("counter_asset_issuer", counter.getIssuer());
        } else {
            this.url.addQuery("counter_asset_type", 'native');
        }
        return this;
    }

    /**
    * Filter trades for a specific offer
    * @param offerId
    * @returns {TradesCallBuilder}
    */
    forOffer(offerId) {
        this.url.addQuery("offer_id", offerId);
        return this;
    }

    /**
     * Filter trades for a specific account
     * @see [Trades for Account](https://www.stellar.org/developers/horizon/reference/trades-for-account.html)
     * @param {string} accountId For example: `GBYTR4MC5JAX4ALGUBJD7EIKZVM7CUGWKXIUJMRSMK573XH2O7VAK3SR`
     * @returns {TradesCallBuilder}
     */
    forAccount(accountId) {
        this.filter.push(['accounts', accountId, 'trades']);
        return this;
    }
}

