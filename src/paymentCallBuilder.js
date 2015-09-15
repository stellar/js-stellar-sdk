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
        this.filter.push(['accounts', accountAddress, 'payments']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.filter.push(['ledgers', ledgerSeq, 'payments']);
        return this;
    }

    forTransaction(transactionID) {
        this.filter.push(['transactions', transactionID, 'payments']);
        return this;
    }
}
