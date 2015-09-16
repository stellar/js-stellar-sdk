import {CallBuilder} from "./callBuilder";

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