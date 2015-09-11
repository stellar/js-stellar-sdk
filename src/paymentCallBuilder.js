import {CallBuilder} from "./callBuilder";

/**
* @class PaymentCallBuilder
*/
export class PaymentCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('payments');
    }

    forAccount(accountAddress) {
        this.url.segment(['accounts', accountAddress, 'payments']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.url.segment(['ledgers', ledgerSeq, 'payments']);
        return this;
    }

    forTransaction(transactionID) {
        this.url.segment(['transactions', transactionID, 'payments']);
        return this;
    }
}
