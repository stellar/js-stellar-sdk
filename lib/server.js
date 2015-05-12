"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var TransactionResult = require("./transaction_result").TransactionResult;

var xdr = require("stellar-base").xdr;

var Account = require("./account").Account;

var request = require("superagent");
var EventSource = typeof window === "undefined" ? require("eventsource") : window.EventSource;

/**
* @class Server
*/

var Server = exports.Server = (function () {
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

    function Server() {
        var config = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Server);

        this.protocol = config.secure ? "https://" : "http://";
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
                    request.post(self.protocol + self.hostname + ":" + self.port + "/transactions").type("json").send({
                        tx: transaction.toEnvelope().toXDR().toString("hex")
                    }).end(function (err, res) {
                        if (res && res.body && res.body.submission_result) {
                            var result = xdr.TransactionResult.fromXDR(new Buffer(res.body.submission_result, "hex"));
                            resolve(new TransactionResult(result));
                        } else {
                            if (res && res.body && res.body.result) {
                                reject({
                                    hash: res.body.hash,
                                    result: res.body.result
                                });
                            } else {
                                console.log(err);
                                reject(err);
                            }
                        }
                    });
                });
            }
        },
        accounts: {

            /**
            * <p>Returns account resources. For a list of all accounts, don't pass an address
            * or resource parameters. For a specific transaction, pass only an address. For a list of
            * account sub resources, pass the account address and the type of sub resources.</p>
            *
            * <p>A configuration object can be passed to each call. Calls that return a collection
            * can be streamed by passing a streaming object in the config object.</p>@param {string} [address] - Returns the given account.
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

            value: function accounts(address, resource, opts) {
                if (!address || typeof address === "object") {
                    opts = address;
                    address = null;
                    resource = null;
                } else if (!resource || typeof resource === "object") {
                    opts = resource;
                    resource = null;
                }
                return this._sendResourceRequest("accounts", address, resource, opts);
            }
        },
        ledgers: {

            /**
            * <p>Returns ledger resources. For a list of all ledgers, don't pass sequence
            * or resource parameters. For a specific transaction, pass only a sequence. For a list of
            * ledger sub resources, pass the sequence and the type of sub resources.</p>
            *
            * <p>A configuration object can be passed to each call. Calls that return a collection
            * can be streamed by passing a streaming object in the config object.</p>@param {number} [sequence] - Returns the given ledger.
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

            value: function ledgers(sequence, resource, opts) {
                if (!sequence || typeof sequence === "object") {
                    opts = sequence;
                    sequence = null;
                    resource = null;
                } else if (!resource || typeof resource === "object") {
                    opts = resource;
                    resource = null;
                }
                return this._sendResourceRequest("ledgers", sequence, resource, opts);
            }
        },
        transactions: {

            /**
            * <p>Returns transaction resources. For a list of all transactions, don't pass hash
            * or resource parameters. For a specific transaction, pass a hash. For a list of
            * transaction sub resources, pass the transaction hash and the type of sub resources.</p>
            *
            * <p>A configuration object can be passed to each call. Calls that return a collection
            * can be streamed by passing a streaming object in the config object.</p>
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

            value: function transactions(hash, resource, opts) {
                if (!hash || typeof hash === object) {
                    opts = hash;
                    hash = null;
                    resource = null;
                } else if (!resource || typeof resource === "object") {
                    opts = resource;
                    resource = null;
                }
                return this._sendResourceRequest("transactions", hash, resource, opts);
            }
        },
        loadAccount: {

            /**
            * Fetches an account's most current state in the ledger and then creates and returns
            * an Account object.
            * @param {string} address - The account to load.
            * @returns {Account} Returns the given address's account with populated sequence number
            *                    and balance information.
            */

            value: function loadAccount(address) {
                var self = this;
                return this.accounts(address).then(function (res) {
                    return new Account(address, res.sequence);
                });
            }
        },
        _sendResourceRequest: {

            /**
            * Sends a request for a resource or collection of resources. For a non streaming
            * request, will return a promise. This will be fulfilled either with the specific
            * resource response, or a collection of responses. Otherwise, for a streaming request,
            * will return the EventSource object.
            * @param {string} type - {"accounts", "ledgers", "transactions"}
            */

            value: function _sendResourceRequest(type, id, resource, opts) {
                // we're not requesting a collection if they specify the id and no sub resource
                var single = id && !resource;
                var endpoint = this._buildEndpointPath(type, id, resource, opts);
                if (opts && opts.streaming) {
                    return this._sendStreamingRequest(endpoint, opts.streaming);
                } else {
                    var promise = this._sendNormalRequest(endpoint);
                    if (!single) {
                        promise = promise.then(this._toCollectionPage.bind(this));
                    }
                    return promise;
                }
            }
        },
        _buildEndpointPath: {
            value: function _buildEndpointPath(type, id, subType, opts) {
                var endpoint = "/" + type;
                if (id) {
                    endpoint += "/" + id;
                }
                if (subType) {
                    endpoint += "/" + subType;
                }
                if (opts) {
                    endpoint = this._appendResourceCollectionConfiguration(endpoint, opts);
                }
                return endpoint;
            }
        },
        _sendNormalRequest: {
            value: function _sendNormalRequest(endpoint) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.get(self.protocol + self.hostname + ":" + self.port + endpoint).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.body);
                        }
                    });
                });
            }
        },
        _sendLinkRequest: {

            /**
            * For those pesky _link.href full URLs we get back from Horizon.
            */

            value: function _sendLinkRequest(href) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.get(href).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.body);
                        }
                    });
                });
            }
        },
        _sendStreamingRequest: {
            value: function _sendStreamingRequest(endpoint, streaming) {
                var es = new EventSource(this.protocol + this.hostname + ":" + this.port + endpoint);
                es.onmessage = streaming.onmessage;
                es.onerror = streaming.onerror;
                return es;
            }
        },
        _appendResourceCollectionConfiguration: {
            value: function _appendResourceCollectionConfiguration(endpoint, opts) {
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
        },
        _toCollectionPage: {
            value: function _toCollectionPage(json) {
                var self = this;
                return {
                    records: json._embedded.records,
                    next: function next() {
                        return self._sendLinkRequest(json._links.next.href).then(self._toCollectionPage.bind(self));
                    },
                    prev: function prev() {
                        return self._sendLinkRequest(json._links.prev.href).then(self._toCollectionPage.bind(self));
                    }
                };
            }
        }
    });

    return Server;
})();