import { CallBuilder } from './call_builder';
import { AssetType } from 'stellar-base';
import { Horizon } from './horizon_api';
import { ServerApi } from './server_api';

/**
 * Creates a new {@link AssetsCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#assets}.
 * @class AssetsCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
export class AssetsCallBuilder extends CallBuilder<ServerApi.CollectionPage<AssetRecord>> {
  constructor(serverUrl: uri.URI) {
    super(serverUrl);
    this.url.segment('assets');
  }

  /**
   * This endpoint filters all assets by the asset code.
   * @param {string} value For example: `USD`
   * @returns {AssetsCallBuilder} current AssetCallBuilder instance
   */
  public forCode(value: string): AssetsCallBuilder {
    this.url.setQuery('asset_code', value);
    return this;
  }

  /**
   * This endpoint filters all assets by the asset issuer.
   * @param {string} value For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {AssetsCallBuilder} current AssetCallBuilder instance
   */
  public forIssuer(value: string): AssetsCallBuilder {
    this.url.setQuery('asset_issuer', value);
    return this;
  }
}

export interface AssetRecord extends Horizon.BaseResponse {
  asset_type: AssetType.credit4 | AssetType.credit12;
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  amount: string;
  num_accounts: number;
  flags: Horizon.Flags;
}