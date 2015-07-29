import {TransactionResult} from "./transaction_result";
import {NotFoundError, NetworkError} from "./errors";

import {xdr, Account} from "stellar-base";

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let UriTemplate = require("uritemplate");

var EventSource = (typeof window === 'undefined') ? require('eventsource') : window.EventSource;

/**
* @class Server
*/
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
        var promise = axios.post(this.protocol + this.hostname + ":" + this.port + '/transactions', {
                tx: transaction.toEnvelope().toXDR().toString("hex")
            })
            .then(function(response) {
                return response.data;
            })
            .catch(function (response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    /**
    * <p>Returns account resources. For a list of all accounts, don't pass an address
    * or resource parameters. For a specific transaction, pass only an address. For a list of
    * account sub resources, pass the account address and the type of sub resources.</p>
    *
    * <p>A configuration object can be passed to each call. Calls that return a collection
    * can be streamed by passing a streaming object in the config object.</p>@param {string} [address] - Returns the given account.
    * @param {string} [resource] - Return a specific resource associated with an account. Can be
    *                              {"transactions", "operations", "effects", "payments", "offers"}.
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
    * @throws {NotFoundError} - If the account does not exist.
    * @throws {NetworkError} - For any other errors thrown by horizon
    */
    accounts(address, resource, opts) {
        if (!address || typeof(address) === "object") {
            opts = address;
            address = null;
            resource = null;
        } else if (!resource || typeof resource === "object") {
            opts = resource;
            resource = null;
        }
        return this._sendResourceRequest("accounts", address, resource, opts);
    }

    /**
    * <p>Returns ledger resources. For a list of all ledgers, don't pass sequence
    * or resource parameters. For a specific transaction, pass only a sequence. For a list of
    * ledger sub resources, pass the sequence and the type of sub resources.</p>
    *
    * <p>A configuration object can be passed to each call. Calls that return a collection
    * can be streamed by passing a streaming object in the config object.</p>@param {number} [sequence] - Returns the given ledger.
    * @param {string} [resource] - Return a specific resource associated with a ledger. Can be
    *                              {"transactions", "operations", "effects", "payments"}.
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
    * @throws {NotFoundError} - If the ledger does not exist.
    * @throws {NetworkError} - For any other errors thrown by horizon
    */
    ledgers(sequence, resource, opts) {
        if (!sequence || typeof(sequence) === "object") {
            opts = sequence;
            sequence = null;
            resource = null;
        } else if (!resource || typeof resource === "object") {
            opts = resource;
            resource = null;
        }
        return this._sendResourceRequest("ledgers", sequence, resource, opts);
    }

    /**
    * <p>Returns transaction resources. For a list of all transactions, don't pass hash
    * or resource parameters. For a specific transaction, pass a hash. For a list of
    * transaction sub resources, pass the transaction hash and the type of sub resources.</p>
    *
    * <p>A configuration object can be passed to each call. Calls that return a collection
    * can be streamed by passing a streaming object in the config object.</p>
    * @param {string} [hash] - Returns the given transaction.
    * @param {string} [resource] - Return a specific resource associated with a transaction. Can be
    *                              {"operations", "effects", "payments"}.
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
    * @throws {NotFoundError} - If the transaction does not exist.
    * @throws {NetworkError} - For any other errors thrown by horizon
    */
    transactions(hash, resource, opts) {
        if (!hash || typeof(hash) === "object") {
            opts = hash;
            hash = null;
            resource = null;
        } else if (!resource || typeof resource === "object") {
            opts = resource;
            resource = null;
        }
        return this._sendResourceRequest("transactions", hash, resource, opts);
    }

    /**
    * Operation's firehose.
    * TODO: support for operation/:id [blocked on horizon]
    * TODO: support for operation/:id/effects [blocked on horizon]
    */
    operations(id, resource, opts) {
        if (!id || typeof(id) === "object") {
            opts = id;
            id = null;
            resource = null;
        } else if (!resource || typeof resource === "object") {
            opts = resource;
            resource = null;
        }
        return this._sendResourceRequest("operations", id, resource, opts);
    }

    /**
    * Payments firehose.
    */
    payments(opts) {
        return this._sendResourceRequest("payments", null, null, opts);
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
                return new Account(address, res.sequence);
            });
    }

    friendbot(address) {
        var endpoint = "/friendbot?addr=" + address;
        return this._sendNormalRequest(endpoint);
    }

    /**
    * Sends a request for a resource or collection of resources. For a non streaming
    * request, will return a promise. This will be fulfilled either with the specific
    * resource response, or a collection of responses. Otherwise, for a streaming request,
    * will return the EventSource object.
    * @param {string} type - {"accounts", "ledgers", "transactions"}
    */
    _sendResourceRequest(type, id, resource, opts) {
        var endpoint = this._buildEndpointPath(type, id, resource, opts);
        if (opts && opts.streaming) {
            return this._sendStreamingRequest(endpoint, opts.streaming);
        } else {
            var promise = this._sendNormalRequest(endpoint)
                .then(this._parseResponse.bind(this));
            return promise;
        }
    }

    _buildEndpointPath(type, id, subType, opts) {
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
        return endpoint;
    }

    _sendNormalRequest(url) {
        if (url.slice(0,4) != "http") {
            url = this.protocol + this.hostname + ":" + this.port + url;
        }
        var promise = axios.get(url)
            .then(function (response) {
                return response.data;
            })
            .catch(this._handleNetworkError);
        return toBluebird(promise);
    }

    _handleNetworkError(response) {
        if (response instanceof Error) {
            return Promise.reject(response);
        } else {
            switch (response.status) {
                case 404:
                    return Promise.reject(new NotFoundError(response.data, response));
                default:
                    return Promise.reject(new NetworkError(response.status, response));
            }
        }
    }

    _sendStreamingRequest(endpoint, streaming) {
        var es = new EventSource(this.protocol + this.hostname + ":" + this.port + endpoint);
        es.onmessage = function (message) {
            var result = message.data ? JSON.parse(message.data) : message;
            streaming.onmessage(result);
        };
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

    _parseResponse(json) {
        if (json._embedded && json._embedded.records) {
            return this._toCollectionPage(json);
        } else {
            return this._parseRecord(json);
        }
    }

    _toCollectionPage(json) {
        var self = this;
        for (var i = 0; i < json._embedded.records.length; i++) {
            json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
        }
        return {
            records: json._embedded.records,
            next: function () {
                return self._sendNormalRequest(json._links.next.href)
                    .then(self._toCollectionPage.bind(self));
            },
            prev: function () {
                return self._sendNormalRequest(json._links.prev.href)
                    .then(self._toCollectionPage.bind(self));
            }
        };
    }

    /**
    * Convert each link into a function on the response object.
    */
    _parseRecord(json) {
        if (!json._links) {
            return json;
        }
        var self = this;
        var linkFn = function (link) {
            return function (opts) {
                if (link.template) {
                    let template = UriTemplate(link.href);
                    return self._sendNormalRequest(_template.expand(opts));
                } else {
                    return self._sendNormalRequest(link.href);
                }
            };
        };
        Object.keys(json._links).map(function(value, index) {
            var link = json._links[value];
            json[value] = linkFn(link);
        });
        return json;
    }
}
