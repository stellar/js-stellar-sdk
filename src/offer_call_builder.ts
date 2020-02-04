import { Asset } from "stellar-base";
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
   * Returns all offers where the given account is the seller.
   *
   * @see [Offers](https://www.stellar.org/developers/horizon/reference/endpoints/offers.html)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public forAccount(id: string): this {
    this.url.setQuery("seller", id);
    return this;
  }

  /**
   * Returns all offers buying an asset.
   * @see [Offers](https://www.stellar.org/developers/horizon/reference/endpoints/offers.html)
   * @see Asset
   * @param {Asset} value For example: `new Asset('USD','GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public buying(asset: Asset): this {
    if (!asset.isNative()) {
      this.url.setQuery("buying_asset_type", asset.getAssetType());
      this.url.setQuery("buying_asset_code", asset.getCode());
      this.url.setQuery("buying_asset_issuer", asset.getIssuer());
    } else {
      this.url.setQuery("buying_asset_type", "native");
    }
    return this;
  }

  /**
   * Returns all offers selling an asset.
   * @see [Offers](https://www.stellar.org/developers/horizon/reference/endpoints/offers.html)
   * @see Asset
   * @param {Asset} value For example: `new Asset('EUR','GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public selling(asset: Asset): this {
    if (!asset.isNative()) {
      this.url.setQuery("selling_asset_type", asset.getAssetType());
      this.url.setQuery("selling_asset_code", asset.getCode());
      this.url.setQuery("selling_asset_issuer", asset.getIssuer());
    } else {
      this.url.setQuery("selling_asset_type", "native");
    }
    return this;
  }
}
