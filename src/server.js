import {TransactionPage} from "./transaction_page";
import {TransactionResult} from "./transaction_result";
import {xdr} from "stellar-base";

let request = require("superagent");
var EventSource = (typeof window === 'undefined') ? require('eventsource') : EventSource;

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
                    if (res && res.body && res.body.submission_result) {
                        let result = xdr.TransactionResult.fromXDR(new Buffer(res.body.submission_result, "hex"));
                        resolve(new TransactionResult(result));
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });
        });
    }

    /**
    * <p>Requests a specific account, a collection of accounts, or resources associated with
    * an account from the server.</p>
    * Depending on the parameters given, this function will return different account related
    * items:
    * <ul>
    * <li>If there are no arguments provided, or if only the 'opts' configuration object
    * is provided, this call will be return a collection of all accounts.</li>
    * <li>If a string is provided as the first argument, it will be interpreted as the
    * 'address' parameter. If the second argument is not a valid sub-resource type, this
    * request will simply return the account's information (the second argument can also be
    * the 'opts' config obejct.</li>
    * <li>If the second argument after the address is a valid sub-resource type, this request
    * will return a collection of that sub-resource associated with the given account's address.</li>
    * </ul>
    * <p>Any request that returns a collection can be made into a streaming request by
    * passing callback functions for the 'opts.onmessage' and 'opts.onerror' handlers.</p>
    * @param {string} [address] - Returns the given account.
    * @param {string} [resource] - Return a specific resource associated with an account. Can be
    *                              {"transactions", "operations", "effects"}.
    * @param {object} [opts] - Optional configuration for the request.
    * @param {string} [opts.after] - Return only resources after the given paging token.
    * @param {number} [opts.limit] - Limit the number of returned resources to the given amount.
    * @param {string} [opts.order] - Order the returned collection in "asc" or "desc" order.
    * @param {object} [opts.streaming] - Streaming handlers. If not null, will turn this request
    *                                    into a streaming request.
    * @param {function} [opts.streaming.onmessage] - If given an onmessage handler, turns this query
    *                                                into a streaming query.
    * @param {function} [opts.streaming.onerror] - If this query is a streaming query, will use the
    *                                              given handler for error messages.
    * @returns {Promise|EventSource} If this is a normal request (non streaming) will return a promise
    *                                that will fulfill when the request completes. Otherwise, it will
    *                                return the EventSource object.
    */
    accounts(address, resource, opts) {
        if (!address || typeof address === "object") {
            return this._sendResourceRequest("accounts", null, null, address);
        }
        if (!resource || typeof resource === "object") {
            return this._sendResourceRequest("accounts", address, null, resource);
        }
        return this._sendResourceRequest("accounts", address, resource, opts);
    }

    /**
    * <p>Requests a specific ledger, a collection of ledgers, or resources associated with
    * a ledger from the server.</p>
    * Depending on the parameters given, this function will return different ledger related
    * items:
    * <ul>
    * <li>If there are no arguments provided, or if only the 'opts' configuration object
    * is provided, this call will be return a collection of all ledgers.</li>
    * <li>If a number is provided as the first argument, it will be interpreted as the
    * ledger 'sequence' parameter. If the second argument is not a valid sub-resource type, this
    * request will simply return the account's information (the second argument can also be
    * the 'opts' config obejct.</li>
    * <li>If the second argument after the id is a valid sub-resource type, this request
    * will return a collection of that sub-resource associated with the given ledgers's sequence.</li>
    * </ul>
    * <p>Any request that returns a collection can be made into a streaming request by
    * passing callback functions for the 'opts.onmessage' and 'opts.onerror' handlers.</p>
    * @param {number} [sequence] - Returns the given ledger.
    * @param {string} [resource] - Return a specific resource associated with a ledger. Can be
    *                              {"transactions", "operations", "effects"}.
    * @param {object} [opts] - Optional configuration for the request.
    * @param {string} [opts.after] - Return only resources after the given paging token.
    * @param {number} [opts.limit] - Limit the number of returned resources to the given amount.
    * @param {string} [opts.order] - Order the returned collection in "asc" or "desc" order.
    * @param {object} [opts.streaming] - Streaming handlers. If not null, will turn this request
    *                                    into a streaming request.
    * @param {function} [opts.streaming.onmessage] - If given an onmessage handler, turns this query
    *                                                into a streaming query.
    * @param {function} [opts.streaming.onerror] - If this query is a streaming query, will use the
    *                                              given handler for error messages.
    * @returns {Promise|EventSource} If this is a normal request (non streaming) will return a promise
    *                                that will fulfill when the request completes. Otherwise, it will
    *                                return the EventSource object.
    */
    ledgers(sequence, resource, opts) {
        if (!sequence || typeof sequence === "object") {
            return this._sendResourceRequest("ledgers", null, null, sequence);
        }
        if (!resource || typeof resource === "object") {
            return this._sendResourceRequest("ledgers", sequence, null, resource);
        }
        return this._sendResourceRequest("ledgers", sequence, resource, opts);
    }

    /**
    * <p>Requests a specific transaction, a collection of transactions, or resources
    * associated with a transaction from the server.</p>
    * Depending on the parameters given, this function will return different transaction related
    * items:
    * <ul>
    * <li>If there are no arguments provided, or if only the 'opts' configuration object
    * is provided, this call will be return a collection of all transactions.</li>
    * <li>If a string is provided as the first argument, it will be interpreted as the
    * transaction 'hash' parameter. If the second argument is not a valid sub-resource type, this
    * request will simply return the transactions's information (the second argument can also be
    * the 'opts' config obejct.</li>
    * <li>If the second argument after the id is a valid sub-resource type, this request
    * will return a collection of that sub-resource associated with the given transaction hash.</li>
    * </ul>
    * <p>Any request that returns a collection can be made into a streaming request by
    * passing callback functions for the 'opts.onmessage' and 'opts.onerror' handlers.</p>
    * @param {string} [hash] - Returns the given transaction.
    * @param {string} [resource] - Return a specific resource associated with a transaction. Can be
    *                              {"operations", "effects"}.
    * @param {object} [opts] - Optional configuration for the request.
    * @param {string} [opts.after] - Return only resources after the given paging token.
    * @param {number} [opts.limit] - Limit the number of returned resources to the given amount.
    * @param {string} [opts.order] - Order the returned collection in "asc" or "desc" order.
    * @param {object} [opts.streaming] - Streaming handlers. If not null, will turn this request
    *                                    into a streaming request.
    * @param {function} [opts.streaming.onmessage] - If given an onmessage handler, turns this query
    *                                                into a streaming query.
    * @param {function} [opts.streaming.onerror] - If this query is a streaming query, will use the
    *                                              given handler for error messages.
    * @returns {Promise|EventSource} If this is a normal request (non streaming) will return a promise
    *                                that will fulfill when the request completes. Otherwise, it will
    *                                return the EventSource object.
    */
    transactions(hash, resource, opts) {
        if (!hash || typeof hash === "object") {
            return this._sendResourceRequest("transactions", null, null, hash);
        }
        if (!resource || typeof resource === "object") {
            return this._sendResourceRequest("transactions", hash, null, resource);
        }
        return this._sendResourceRequest("transactions", hash, resource, opts);
    }

    /**
    * Fetches an account's most current state in the ledger and then creates and returns
    * an Account object.
    * @param {string} address - The account to load.
    * @returns {Account} Returns the given address's account with populated sequence number
    *                    and balance information.
    */
    loadAccount(address) {
        var self = this;
        return this.accounts(address)
            .then(function (res) {
                return new Account(address, res.body.sequence);
            });
    }

    /**
    * @deprecated Use the {@link Server#transactions} API instead
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
    * @deprecated Use the {@link Server#transactions} API instead
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
    * @deprecated Use the {@link Server#accounts} API instead
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
    * @deprecated Use the {@link Server#transactions} API instead
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

    _sendResourceRequest(type, id, subType, opts) {
        let endpoint = "/" + type;
        if (id) {
            endpoint += "/" + id;
        }
        if (subType) {
            endpoint += "/" +subType;
        }
        if (opts) {
            endpoint = this._appendResourceCollectionConfiguration(endpoint, opts);
        }
        if (opts && opts.streaming) {
            return this._sendStreamingResourceRequest(endpoint, opts.streaming);
        } else {
            return this._sendNormalResourceRequest(endpoint);
        }
    }

    _sendNormalResourceRequest(endpoint, handler) {
        var self = this;
        return new Promise(function (resolve, reject) {
            request
                .get(self.protocol + self.hostname + ":" + self.port + endpoint)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });
        });
    }

    _sendStreamingResourceRequest(endpoint, streaming) {
        var es = new EventSource(this.protocol + this.hostname + ":" + this.port + endpoint);
        es.onmessage = streaming.onmessage;
        es.onerror = streaming.onerror;
        return es;
    }

    _appendResourceCollectionConfiguration(endpoint, opts) {
        endpoint = endpoint + "?";
        if (opts.after) {
            endpoint += "after=" + opts.after;
        }
        if (opts.limit) {
            endpoint += "&limit=" + opts.limit;
        }
        if (opts.order) {
            endpoint += "&order=" + opts.order;
        }
        return endpoint;
    }
}