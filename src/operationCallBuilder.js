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
        this.url.segment(['operations', operationID]);
        return this;
    }

    forAccount(accountAddress) {
        this.url.segment(['accounts', accountAddress, 'operations']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.url.segment(['ledgers', ledgerSeq, 'operations']);
        return this;
    }

    forTransaction(transactionID) {
        this.url.segment(['transactions', transactionID, 'operations']);
        return this;
    }
}
