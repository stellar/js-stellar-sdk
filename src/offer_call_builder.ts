import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link OfferCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#offers}.
 *
 * @see [Offers](https://www.stellar.org/developers/horizon/reference/endpoints/offers.html)
 * @class OfferCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class OfferCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.OfferRecord>
> {
  constructor(serverUrl: uri.URI) {
    super(serverUrl);
    this.url.segment("offers");
  }

  /**
   * Returns offers relating to a single account.
   *
   * @see [Offers](https://www.stellar.org/developers/horizon/reference/endpoints/offers.html)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */
  public forAccount(id: string): this {
    this.url.setQuery("seller", id);
    return this;
  }
}
