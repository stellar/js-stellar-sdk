import {CallBuilder} from "./call_builder";

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
        this.filter.push(['transactions', transactionID]);
        return this;
    }

    forAccount(accountAddress) {
        this.filter.push(['accounts', accountAddress, 'transactions']);
        return this;
    }

    forLedger(ledgerSeq) {
        this.filter.push(['ledgers', ledgerSeq, 'transactions']);
        return this;
    }
}
