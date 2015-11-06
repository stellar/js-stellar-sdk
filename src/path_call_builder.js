import {CallBuilder} from './call_builder';

/**
* @class PathCallBuilder
*/
export class PathCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url, source, destination, destination_asset, destination_amount) {
        super(url);
        this.url.segment('paths');
        this.url.addQuery('destination_account', destination);
        this.url.addQuery('source_account', source);
        this.url.addQuery('destination_amount', destination_amount);

        if (!destination_asset.isNative()) {
            this.url.addQuery('destination_asset_type', destination_asset.getAssetType());
            this.url.addQuery('destination_asset_code', destination_asset.getCode());
            this.url.addQuery('destination_asset_issuer', destination_asset.getIssuer());
        } else {
            this.url.addQuery('destination_asset_type', 'native');
        }
    }
}
