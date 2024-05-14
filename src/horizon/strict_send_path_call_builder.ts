import { Asset } from "@stellar/stellar-base";
import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * The Stellar Network allows payments to be made across assets through path
 * payments. A strict send path payment specifies a series of assets to route a
 * payment through, from source asset (the asset debited from the payer) to
 * destination asset (the asset credited to the payee).
 *
 * A strict send path search is specified using:
 *
 * The source asset
 * The source amount
 * The destination assets or destination account.
 *
 * As part of the search, horizon will load a list of assets available to the
 * source address and will find any payment paths from those source assets to
 * the desired destination asset. The search's source_amount parameter will be
 * used to determine if there a given path can satisfy a payment of the desired
 * amount.
 *
 * Do not create this object directly, use {@link Server#strictSendPaths}.
 * @see {@link https://developers.stellar.org/network/horizon/api-reference/aggregations/paths|Find Payment Paths}
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {Asset} sourceAsset The asset to be sent.
 * @param {string} sourceAmount The amount, denominated in the source asset, that any returned path should be able to satisfy.
 * @param {string|Asset[]} destination The destination account or the destination assets.
 *
 */
export class StrictSendPathCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.PaymentPathRecord>
> {
  constructor(
    serverUrl: URI,
    sourceAsset: Asset,
    sourceAmount: string,
    destination: string | Asset[]
  ) {
    super(serverUrl);

    this.url.segment("paths/strict-send");

    if (sourceAsset.isNative()) {
      this.url.setQuery("source_asset_type", "native");
    } else {
      this.url.setQuery("source_asset_type", sourceAsset.getAssetType());
      this.url.setQuery("source_asset_code", sourceAsset.getCode());
      this.url.setQuery("source_asset_issuer", sourceAsset.getIssuer());
    }

    this.url.setQuery("source_amount", sourceAmount);

    if (typeof destination === "string") {
      this.url.setQuery("destination_account", destination);
    } else {
      const assets = destination
        .map((asset) => {
          if (asset.isNative()) {
            return "native";
          }

          return `${asset.getCode()}:${asset.getIssuer()}`;
        })
        .join(",");

      this.url.setQuery("destination_assets", assets);
    }
  }
}
