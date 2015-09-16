import {CallBuilder} from "./call_builder";

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
        this.filter.push(['accounts', accountAddress, 'effects']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.filter.push(['ledgers', ledgerSeq, 'effects']);
        return this;
    }

    forTransaction(transactionID) {
        this.filter.push(['transactions', transactionID, 'effects']);
        return this;
    }

    forOperation(operationID) {
        this.filter.push(['operations', operationID, 'effects']);
        return this;
    }
}
