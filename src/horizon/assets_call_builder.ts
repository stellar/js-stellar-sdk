import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link AssetsCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server.assets}.
 *
 * @internal
 * @param serverUrl Horizon server URL.
 * @category Network / Horizon
 */
export class AssetsCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.AssetRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient);
    this.setPath("assets");
  }

  /**
   * This endpoint filters all assets by the asset code.
   * @param value For example: `USD`
   * @returns current AssetCallBuilder instance
   */
  public forCode(value: string): AssetsCallBuilder {
    this.url.searchParams.set("asset_code", value);
    return this;
  }

  /**
   * This endpoint filters all assets by the asset issuer.
   * @param value For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns current AssetCallBuilder instance
   */
  public forIssuer(value: string): AssetsCallBuilder {
    this.url.searchParams.set("asset_issuer", value);
    return this;
  }
}
