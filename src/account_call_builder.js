import {CallBuilder} from "./call_builder";

/**
* @class AccountCallBuilder
*/
export class AccountCallBuilder extends CallBuilder {

    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('accounts');
    }


    address(accountAddress) {
        this.filter.push(['accounts', accountAddress]);
        return this;
    }

}