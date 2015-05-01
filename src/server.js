import {TransactionPage} from "./transaction_page";
import {xdr} from "stellar-base";

let request = require("superagent");

export class Server {
    /**
    * Server handles a network connection to a Horizon instance and exposes an
    * interface for requests to that instance.
    * @constructor
    * @param {object}   [config] - The server configuration.
    * @param {boolean}  [config.secure] - Use https, defaults false.
    * @param {string}   [config.hostname] - The hostname of the Hoirzon server.
    *                                       defaults to "localhost".
    * @param {number}   [config.port] - Horizon port, defaults to 3000.
    */
    constructor(config={}) {
        this.protocol = config.secure ? "https://" : "http://";
        this.hostname = config.hostname || "localhost";
        this.port = config.port || 3000;
    }

    /**
    * Submits a transaction to the network.
    * @param {Transaction} transaction - The transaction to submit.
    */
    submitTransaction(transaction) {
        var self = this;
        return new Promise(function (resolve, reject) {
            request
                .post(self.protocol + self.hostname + ":" + self.port + '/transactions')
                .type('json')
                .send({
                    tx: transaction.toEnvelope().toXDR().toString("hex")
                })
                .end(function(err, res) {
                    if (!err) {
                        console.log(res);
                        let result = xdr.TransactionResult.fromXDR(new Buffer(res.body.submission_result, "hex"));
                        resolve(result);
                    } else if (res && res.body) {
                        console.log(res);
                        let result = xdr.TransactionResult.fromXDR(new Buffer(res.body.submission_result, "hex"));
                        console.log(result._attributes.result);
                        resolve(result);
                    } else {
                        console.log(err);
                    }
                });
        });
    }


    /**
    * Loads account details to the given account object.
    * @param {Account} account - The account to load. Will modify this object with
    */
    loadAccount(account) {
        var self = this;
        return new Promise(function (resolve, reject) {
            request
                .get(self.protocol + self.hostname + ":" + self.port + '/accounts/' + account.address)
                .end(function(err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        account.sequence = res.body.sequence + 1;
                        account.balances = res.body.balances;
                        resolve();
                    }
                });
        });
    }

    /**
    * Returns the json transaction record of the given transaction hash.
    * @param {string} hash - The hash of the transaction.
    */
    getTransaction(hash) {
        var self = this;
        return new Promise(function (resolve, reject) {
            request
                .get(self.protocol + self.hostname + ":" + self.port + '/transactions/' + hash)
                .end(function(err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });
        });
    }

    /**
    * Returns a TransactionPage for the latest transactions in the network.
    * Transaction results will be ordered in descending order. The returned
    * TransactionPage can be passed to Server.getNextTransactions() or
    * Server.getPreviousTransactions() for the next page of transactions.
    * @param {object} [opts]
    * @param {number} [opts.limit] - The max amount of transactions to return in
    *                                this page. Default is 100.
    */
    getTransactions(opts={}) {
        var self = this;
        var limit = opts.limit ? opts.limit : 100;
        return new Promise(function (resolve, reject) {
            request
                .get(self.protocol + self.hostname + ":" + self.port +
                    '/transactions' + '?limit=' + limit)
                .end(function(err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new TransactionPage(res.body));
                    }
                });
        });
    }

    /**
    * Returns a TransactionPage for the transactions on the given address.
    * Transaction results will be ordered in descending order. The returned
    * TransactionPage can be passed to Server.getNextTransactions() or
    * Server.getPreviousTransactions() for the next page of transactions.
    * @param {string} address - The address of the account to retrieve txns from.
    * @param {object} [opts]
    * @param {number} [opts.limit] - The max amount of transactions to return in
    *                                this page. Default is 100.
    */
    getAccountTransactions(address, opts={}) {
        var self = this;
        var limit = opts.limit ? opts.limit : 100;
        return new Promise(function (resolve, reject) {
            request
                .get(self.protocol + self.hostname + ":" + self.port +
                    '/accounts/' + address + '/transactions' +
                    '?limit=' + limit)
                .end(function(err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new TransactionPage(res.body));
                    }
                });
        });
    }

    /**
    * Given a TransactionPage, this will return a new transaction page with
    * the "next" transactions in the collection.
    * @param {TransactionPage} page
    * @param {object} [opts]
    * @param {number} [opts.limit] - The max amount of transactions to return in
    *                                this page. Default is 100.
    */
    getNextTransactions(page, opts) {
        return new Promise(function (resolve, reject) {
            request
                .get(page.next)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new TransactionPage(res.body));
                    }
                });
        });
    }

    /* TODO: implement once previous is supported in horizon
    getPreviousTransactions(page, opts) {
        return new Promise(function (resolve, reject) {
            request
                .get(page.next)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });
        });
    }
    */
}