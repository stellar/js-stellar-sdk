import {CallBuilder} from "./callBuilder";

/**
* @class EffectCallBuilder
*/
export class EffectCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('effects');
    }

    forAccount(accountAddress) {
        this.url.segment(['accounts', accountAddress, 'effects']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.url.segment(['ledgers', ledgerSeq, 'effects']);
        return this;
    }

    forTransaction(transactionID) {
        this.url.segment(['transactions', transactionID, 'effects']);
        return this;
    }

    forOperation(operationID) {
        this.url.segment(['operations', operationID, 'effects']);
        return this;
    }
}
