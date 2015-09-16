import {TransactionResult} from "./transaction_result";
import {NotFoundError, NetworkError, BadRequestError} from "./errors";

import {AccountCallBuilder} from "./account_call_builder";
import {LedgerCallBuilder} from "./ledger_call_builder";
import {TransactionCallBuilder} from "./transaction_call_builder";
import {OperationCallBuilder} from "./operation_call_builder";
import {OfferCallBuilder} from "./offer_call_builder";
import {OrderbookCallBuilder} from "./orderbook_call_builder";
import {PaymentCallBuilder} from "./payment_call_builder";
import {EffectCallBuilder} from "./effect_call_builder";
import {xdr, Account} from "stellar-base";

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let URI = require("URIjs");
let URITemplate = require("URIjs").URITemplate;

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
        this.protocol = config.secure ? "https" : "http";
        this.hostname = config.hostname || "localhost";
        this.port = config.port || 3000;
        this.serverURL = URI({ protocol: this.protocol, 
                             hostname: this.hostname,
                             port: this.port });
    }

    /**
    * Submits a transaction to the network.
    * @param {Transaction} transaction - The transaction to submit.
    */
    submitTransaction(transaction) {
        var promise = axios.post(URI(this.serverURL).path('transactions').toString(), {
                tx: transaction.toEnvelope().toXDR().toString("base64")
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
    * @param {object} [streaming] - Streaming handlers. If not null, will turn this request
    *                                    into a streaming request.
    * @param {function} [streaming.onmessage] - If given an onmessage handler, turns this query
    *                                                into a streaming query.
    * @param {function} [streaming.onerror] - If this query is a streaming query, will use the
    *                                              given handler for error messages.
    * @returns {Promise|EventSource} If this is a normal request (non streaming) will return a promise
    *                                that will fulfill when the request completes. Otherwise, it will
    *                                return the EventSource object.
    * @throws {NotFoundError} - If the account does not exist.
    * @throws {NetworkError} - For any other errors thrown by horizon
    */
    accounts() {
        return new AccountCallBuilder(URI(this.serverURL));
    }

   
    ledgers() {
        return new LedgerCallBuilder(URI(this.serverURL));
    }

    transactions() {
        return new TransactionCallBuilder(URI(this.serverURL));
    }

    /* 
    * Should be
    * offers('accounts', accountID) or
    */
    offers(resource, ...resourceParams) {
        return new OfferCallBuilder(URI(this.serverURL), resource, ...resourceParams);
    }

    orderbook(selling, buying) {
        return new OrderbookCallBuilder(URI(this.serverURL), selling, buying);
    }

    operations() {
        return new OperationCallBuilder(URI(this.serverURL));
    }

    payments() {
        return new PaymentCallBuilder(URI(this.serverURL));
    }

    effects() {
        return new EffectCallBuilder(URI(this.serverURL));
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
        return this.accounts()
            .address(address)
            .call()
            .then(function (res) {
                return new Account(address, res.sequence);
            });
    }

    friendbot(address) {
        var url = URI(this.serverURL).path("friendbot").addQuery("addr", address);
        return this._sendNormalRequest(url);
    }

    _sendNormalRequest(url) {
        // To fix:  #15 Connection Stalled when making multiple requests to the same resource
        url.addQuery('c', Math.random());
        var promise = axios.get(url.toString())
            .then(response => response.data)
            .catch(this._handleNetworkError);
        return toBluebird(promise);
    }
}

 
