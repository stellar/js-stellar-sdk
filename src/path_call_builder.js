import {CallBuilder} from './call_builder';

/**
 * The Stellar Network allows payments to be made across assets through path payments. A path payment specifies a
 * series of assets to route a payment through, from source asset (the asset debited from the payer) to destination
 * asset (the asset credited to the payee).
 *
 * A path search is specified using:
 *
 * * The destination address
 * * The source address
 * * The asset and amount that the destination account should receive
 *
 * As part of the search, horizon will load a list of assets available to the source address and will find any
 * payment paths from those source assets to the desired destination asset. The search's amount parameter will be
 * used to determine if there a given path can satisfy a payment of the desired amount.
 *
 * Do not create this object directly, use {@link Server#paths}.
 * @see [Find Payment Paths](https://www.stellar.org/developers/horizon/reference/path-finding.html)
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {string} source The sender's account ID. Any returned path must use a source that the sender can hold.
 * @param {string} destination The destination account ID that any returned path should use.
 * @param {Asset} destinationAsset The destination asset.
 * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
 */
export class PathCallBuilder extends CallBuilder {
    constructor(serverUrl, source, destination, destinationAsset, destinationAmount) {
        super(serverUrl);
        this.url.segment('paths');
        this.url.addQuery('destination_account', destination);
        this.url.addQuery('source_account', source);
        this.url.addQuery('destination_amount', destinationAmount);

        if (!destinationAsset.isNative()) {
            this.url.addQuery('destination_asset_type', destinationAsset.getAssetType());
            this.url.addQuery('destination_asset_code', destinationAsset.getCode());
            this.url.addQuery('destination_asset_issuer', destinationAsset.getIssuer());
        } else {
            this.url.addQuery('destination_asset_type', 'native');
        }
    }
}
