import {CallBuilder} from "./call_builder";

/**
 * Creates a new {@link AccountCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#accounts}.
 *
 * @see [All Accounts](https://www.stellar.org/developers/horizon/reference/accounts-all.html)
 * @class AccountCallBuilder
 * @extends CallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class AccountCallBuilder extends CallBuilder {
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('accounts');
    }

    /**
     * Returns information and links relating to a single account.
     * The balances section in the returned JSON will also list all the trust lines this account has set up.
     *
     * @see [Account Details](https://www.stellar.org/developers/horizon/reference/accounts-single.html)
     * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AccountCallBuilder}
     */
    accountId(id) {
      this.filter.push(['accounts', id]);
      return this;
    }
}
