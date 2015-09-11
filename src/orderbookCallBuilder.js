import {CallBuilder} from "./callBuilder";

/**
* @class OrderbookCallBuilder
*/
export class OrderbookCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url, selling, buying) {
        super(url);
        this.url.segment('order_book');
        if (!selling.isNative()) {
            this.url.addQuery("selling_asset_type", 'credit_alphanum4');
            this.url.addQuery("selling_asset_code", selling.getCode());
            this.url.addQuery("selling_issuer", selling.getIssuer());
        } else {
            this.url.addQuery("selling_asset_type", 'native');
        }
        if (!buying.isNative()) {
            this.url.addQuery("buying_asset_type", 'credit_alphanum4');
            this.url.addQuery("buying_asset_code", buying.getCode());
            this.url.addQuery("buying_issuer", buying.getIssuer());
        } else {
            this.url.addQuery("buying_asset_type", 'native');
        }
    }

}
