import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#ledgers}.
 * @see [All Ledgers](https://www.stellar.org/developers/horizon/reference/ledgers-all.html)
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
     * Provides information on a single ledger.
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {LedgerCallBuilder}
     */
    () {
        // this.filter.push(['accounts', sequence.toString()]);
        return this;
    }

}



/**
https://horizon.stellar.org/assets?asset_code=USD&limit=10
https://horizon.stellar.org/assets?asset_issuer=<some_issuer>
https://horizon.stellar.org/assets?order=desc
*/
