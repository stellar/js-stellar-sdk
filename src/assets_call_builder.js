import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#ledgers}.
 * @see [All Ledgers](https://www.stellar.org/developers/horizon/reference/ledgers-all.html)
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {string} asset_issuer Public Key of issuer of interest
 * @param {string} asset_code Public Code of asset of interest
 */
export class AssetsCallBuilder extends CallBuilder {
    constructor(serverUrl) {
        //      "href": "http://localhost:8000/assets{?asset_code,asset_issuer,cursor,limit,order}",
        super(serverUrl);
        this.url.segment('assets');
    }

    code(value){
        this.url.addQuery("asset_code", value);
        return this;
    }

    issuer(value){
        this.url.addQuery("asset_issuer", value);
        return this;
    }
}

