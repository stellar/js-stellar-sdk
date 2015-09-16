import {CallBuilder} from "./callBuilder";

/**
* @class OperationCallBuilder
*/
export class OperationCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('operations');
    }

    operation(operationID) {
        this.filter.push(['operations', operationID]);
        return this;
    }

    forAccount(accountAddress) {
        this.filter.push(['accounts', accountAddress, 'operations']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.filter.push(['ledgers', ledgerSeq, 'operations']);
        return this;
    }

    forTransaction(transactionID) {
        this.filter.push(['transactions', transactionID, 'operations']);
        return this;
    }
}
