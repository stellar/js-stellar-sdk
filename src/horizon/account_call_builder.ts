import { Asset } from "stellar-base";
import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link AccountCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#accounts}.
 *
 * @see [All Accounts](https://developers.stellar.org/api/resources/accounts/)
 * @class AccountCallBuilder
 * @extends CallBuilder
 * @constructor
 * @param {string} serverUrl Horizon server URL.
 */
export class AccountCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.AccountRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("accounts");
  }

  /**
   * Returns information and links relating to a single account.
   * The balances section in the returned JSON will also list all the trust lines this account has set up.
   *
   * @see [Account Details](https://developers.stellar.org/api/resources/accounts/single/)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {CallBuilder} a new CallBuilder instance for the /accounts/:id endpoint
   */
  public accountId(id: string): CallBuilder<ServerApi.AccountRecord> {
    const builder = new CallBuilder<ServerApi.AccountRecord>(this.url.clone());
    builder.filter.push([id]);
    return builder;
  }

  /**
   * This endpoint filters accounts by signer account.
   * @see [Accounts](https://developers.stellar.org/api/resources/accounts/list/)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */
  public forSigner(id: string): this {
    this.url.setQuery("signer", id);
    return this;
  }

  /**
   * This endpoint filters all accounts who are trustees to an asset.
   * @see [Accounts](https://developers.stellar.org/api/resources/accounts/list/)
   * @see Asset
   * @param {Asset} asset For example: `new Asset('USD','GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')`
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */
  public forAsset(asset: Asset): this {
    this.url.setQuery("asset", `${asset}`);
    return this;
  }

  /**
   * This endpoint filters accounts where the given account is sponsoring the account or any of its sub-entries..
   * @see [Accounts](https://developers.stellar.org/api/resources/accounts/list/)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */
  public sponsor(id: string): this {
    this.url.setQuery("sponsor", id);
    return this;
  }

  /**
   * This endpoint filters accounts holding a trustline to the given liquidity pool.
   *
   * @param {string} id The ID of the liquidity pool. For example: `dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7`.
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */
  public forLiquidityPool(id: string): this {
    this.url.setQuery("liquidity_pool", id);
    return this;
  }
}
