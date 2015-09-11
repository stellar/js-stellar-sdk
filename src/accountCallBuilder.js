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
        this.url.segment(['accounts', accountAddress]);
        return this;
    }

}