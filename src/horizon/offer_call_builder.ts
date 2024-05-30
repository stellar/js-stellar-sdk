import { Asset } from "@stellar/stellar-base";
import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link OfferCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#offers}.
 *
 * @see [Offers](https://developers.stellar.org/api/resources/offers/)
 * @class OfferCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class OfferCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.OfferRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl, "offers");
    this.url.segment("offers");
  }

  /**
   * The offer details endpoint provides information on a single offer. The offer ID provided in the id
   * argument specifies which offer to load.
   * @see [Offer Details](https://developers.stellar.org/api/resources/offers/single/)
   * @param {string} offerId Offer ID
   * @returns {CallBuilder<ServerApi.OfferRecord>} CallBuilder<ServerApi.OfferRecord> OperationCallBuilder instance
   */
  public offer(offerId: string): CallBuilder<ServerApi.OfferRecord> {
    const builder = new CallBuilder<ServerApi.OfferRecord>(this.url.clone());
    builder.filter.push([offerId]);
    return builder;
  }

  /**
   * Returns all offers where the given account is involved.
   *
   * @see [Offers](https://developers.stellar.org/api/resources/accounts/offers/)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public forAccount(id: string): this {
    return this.forEndpoint("accounts", id);
  }

  /**
   * Returns all offers buying an asset.
   * @see [Offers](https://developers.stellar.org/api/resources/offers/list/)
   * @see Asset
   * @param {Asset} asset For example: `new Asset('USD','GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')`
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
   * @see [Offers](https://developers.stellar.org/api/resources/offers/list/)
   * @see Asset
   * @param {Asset} asset For example: `new Asset('EUR','GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')`
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

  /**
   * This endpoint filters offers where the given account is sponsoring the offer entry.
   * @see [Offers](https://developers.stellar.org/api/resources/offers/list/)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public sponsor(id: string): this {
    this.url.setQuery("sponsor", id);
    return this;
  }

  /**
   * This endpoint filters offers where the given account is the seller.
   *
   * @see [Offers](https://developers.stellar.org/api/resources/offers/list/)
   * @param {string} seller For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {OfferCallBuilder} current OfferCallBuilder instance
   */
  public seller(seller: string): this {
    this.url.setQuery("seller", seller);
    return this;
  }
}
