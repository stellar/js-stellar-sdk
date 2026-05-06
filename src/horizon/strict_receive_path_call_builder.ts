import { Asset } from "../base/index.js";
import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * The Stellar Network allows payments to be made across assets through path
 * payments. A strict receive path payment specifies a series of assets to route
 * a payment through, from source asset (the asset debited from the payer) to
 * destination asset (the asset credited to the payee).
 *
 * A path search is specified using:
 *
 * * The source address or source assets.
 * * The asset and amount that the destination account should receive
 *
 * As part of the search, horizon will load a list of assets available to the
 * source address and will find any payment paths from those source assets to
 * the desired destination asset. The search's amount parameter will be used to
 * determine if there a given path can satisfy a payment of the desired amount.
 *
 * If a list of assets is passed as the source, horizon will find any payment
 * paths from those source assets to the desired destination asset.
 *
 * Do not create this object directly, use {@link Horizon.Server.strictReceivePaths}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/aggregations/paths | Find Payment Paths}
 *
 * @internal
 *
 * @param serverUrl Horizon server URL.
 * @param source The sender's account ID or a list of Assets. Any returned path must use a source that the sender can hold.
 * @param destinationAsset The destination asset.
 * @param destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
 */
export class StrictReceivePathCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.PaymentPathRecord>
> {
  constructor(
    serverUrl: URL,
    httpClient: HttpClient,
    source: string | Asset[],
    destinationAsset: Asset,
    destinationAmount: string,
  ) {
    super(serverUrl, httpClient);
    this.setPath("paths/strict-receive");

    if (typeof source === "string") {
      this.url.searchParams.set("source_account", source);
    } else {
      const assets = source
        .map((asset) => {
          if (asset.isNative()) {
            return "native";
          }

          return `${asset.getCode()}:${asset.getIssuer()}`;
        })
        .join(",");
      this.url.searchParams.set("source_assets", assets);
    }

    this.url.searchParams.set("destination_amount", destinationAmount);
    const issuer = destinationAsset.getIssuer();
    if (!destinationAsset.isNative() && issuer !== undefined) {
      this.url.searchParams.set(
        "destination_asset_type",
        destinationAsset.getAssetType(),
      );
      this.url.searchParams.set(
        "destination_asset_code",
        destinationAsset.getCode(),
      );
      this.url.searchParams.set("destination_asset_issuer", issuer);
    } else {
      this.url.searchParams.set("destination_asset_type", "native");
    }
  }
}
