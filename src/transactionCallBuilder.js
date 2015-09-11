import {CallBuilder} from "./callBuilder";

/**
* @class TransactionCallBuilder
*/
export class TransactionCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url) {
        super(url);
        this.url.segment('transactions');
    }

    transaction(transactionID) {
        this.url.segment(['transactions', transactionID]);
        return this;
    }

    forAccount(accountAddress) {
        this.url.segment(['accounts', accountAddress, 'transactions']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.url.segment(['ledgers', ledgerSeq, 'transactions']);
        return this;
    }
}
