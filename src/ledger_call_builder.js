import {CallBuilder} from "./call_builder";

/**
* @class LedgerCallBuilder
*/
export class LedgerCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('ledgers');
    }

    ledger(ledgerSeq) {
        this.filter.push(['ledgers', ledgerSeq]);
        return this;
    }

}
