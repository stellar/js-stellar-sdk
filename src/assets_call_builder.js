import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link AssetsCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#assets}.
 * @class AssetsCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class AssetsCallBuilder extends CallBuilder {
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('assets');
    }

    /**
     * This endpoint filters all assets by the asset code.
     * @param {string} value For example: `USD`
     * @returns {AssetsCallBuilder}
     */
    forCode(value){
        this.url.addQuery("asset_code", value);
        return this;
    }

    /**
     * This endpoint filters all assets by the asset issuer.
     * @param {string} value For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AssetsCallBuilder}
     */
    forIssuer(value){
        this.url.addQuery("asset_issuer", value);
        return this;
    }
}

