import {CallBuilder} from "./callBuilder";

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
        this.url.segment(['ledgers', ledgerSeq]);
        return this;
    }

}
