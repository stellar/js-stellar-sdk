import {CallBuilder} from './call_builder';

/**
* @class PathCallBuilder
*/
export class PathCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url, source, destination, destination_type, destination_amount) {
        super(url);
        this.url.segment('paths');
        this.url.addQuery('destination_account', destination);
        this.url.addQuery('source_account', source);
        this.url.addQuery('destination_amount', destination_amount);

        if (!destination_type.isNative()) {
            this.url.addQuery('destination_asset_type', 'credit_alphanum4');
            this.url.addQuery('destination_asset_code', destination_type.getCode());
            this.url.addQuery('destination_asset_issuer', destination_type.getIssuer());
        } else {
            this.url.addQuery('destination_asset_type', 'native');
        }
    }
}
