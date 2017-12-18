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
    constructor(serverUrl,asset_code,asset_issuer) {
        //      "href": "http://localhost:8000/assets{?asset_code,asset_issuer,cursor,limit,order}",
        super(serverUrl);
        this.url.segment('assets');
        if (!asset_code)){
            
        }
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

ACCT: GAXUUSLV6N3LN4YARKRNFDCAWN5WYGKCBN3VU5HJNZ2GWK5AXCH5RNT6
SECRET: SD677LEZVVH72YZY4DOW7Q2SPFKPOKZUI26FXZT27J4VXFLK26Z6TKUN


ACCT: GC3DNCXRH2HQW2X5CAKKXQWZ3BDMYTKJVHGUKA3M7UZHRZDRA7FNH6W4
SECRET: SA7CAIK6T2UYYWUDW3F2SPX2NTDCQRB4GN3ZMNMSNU4ITHUWU52W6SYM


https://horizon-testnet.stellar.org/
order_book?
selling_asset_type=native&
buying_asset_type=credit_alphanum4&
buying_asset_code=FOO&
buying_asset_issuer=GBAUUA74H4XOQYRSOW2RZUA4QL5PB37U3JS5NE3RTB2ELJVMIF5RLMAG&limit=20






*/


