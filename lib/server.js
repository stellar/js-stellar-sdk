"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var TransactionPage = require("./transaction_page").TransactionPage;

var request = require("superagent");

/**
* Server handles a network connection to a Horizon instance and exposes an
* interface for requests to that instance.
*/

var Server = exports.Server = (function () {
    function Server() {
        var config = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Server);

        this.hostname = config.hostname || "localhost";
        this.port = config.port || 3000;
    }

    _createClass(Server, {
        submitTransaction: {

            /**
            * Submits a transaction to the network.
            * @param {Transaction} transaction - The transaction to submit.
            */

            value: function submitTransaction(transaction) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.post("http://" + self.hostname + ":" + self.port + "/transactions").type("json").send({
                        tx: transaction.toEnvelope().toXDR().toString("hex")
                    }).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(JSON.stringify(res.body));
                        }
                    });
                });
            }
        },
        loadAccount: {

            /**
            * Loads account details to the given account object.
            * @param {Account} account - The account to load. Will modify this object with
            */

            value: function loadAccount(account) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.get("http://" + self.hostname + ":" + self.port + "/accounts/" + account.address).end(function (err, res) {
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
        },
        getTransaction: {

            /**
            * Returns the json transaction record of the given transaction hash.
            * @param {string} hash - The hash of the transaction.
            */

            value: function getTransaction(hash) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.get("http://" + self.hostname + ":" + self.port + "/transactions/" + hash).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.body);
                        }
                    });
                });
            }
        },
        getTransactions: {

            /**
            * Returns a TransactionPage for the latest transactions in the network.
            * Transaction results will be ordered in descending order. The returned
            * TransactionPage can be passed to Server.getNextTransactions() or
            * Server.getPreviousTransactions() for the next page of transactions.
            * @param {object} [opts]
            * @param {number} [opts.limit] - The max amount of transactions to return in
            *                                this page. Default is 100.
            */

            value: function getTransactions() {
                var opts = arguments[0] === undefined ? {} : arguments[0];

                var self = this;
                var limit = opts.limit ? opts.limit : 100;
                return new Promise(function (resolve, reject) {
                    request.get("http://" + self.hostname + ":" + self.port + "/transactions" + "?limit=" + limit).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(new TransactionPage(res.body));
                        }
                    });
                });
            }
        },
        getAccountTransactions: {

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

            value: function getAccountTransactions(address) {
                var opts = arguments[1] === undefined ? {} : arguments[1];

                var self = this;
                var limit = opts.limit ? opts.limit : 100;
                return new Promise(function (resolve, reject) {
                    request.get("http://" + self.hostname + ":" + self.port + "/accounts/" + address + "/transactions" + "?limit=" + limit).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(new TransactionPage(res.body));
                        }
                    });
                });
            }
        },
        getNextTransactions: {

            /**
            * Given a TransactionPage, this will return a new transaction page with
            * the "next" transactions in the collection.
            * @param {TransactionPage} page
            * @param {object} [opts]
            * @param {number} [opts.limit] - The max amount of transactions to return in
            *                                this page. Default is 100.
            */

            value: function getNextTransactions(page, opts) {
                return new Promise(function (resolve, reject) {
                    request.get(page.next).end(function (err, res) {
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
    });

    return Server;
})();