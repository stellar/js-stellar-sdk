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
import {FriendbotBuilder} from "./friendbot_builder";
import {xdr, Account} from "stellar-base";

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let URI = require("URIjs");
let URITemplate = require("URIjs").URITemplate;

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
        let tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
        var promise = axios.post(URI(this.serverURL).path('transactions').toString(), `tx=${tx}`)
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
    * offers('accounts', accountID)
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

    friendbot(address) {
        return new FriendbotBuilder(URI(this.serverURL), address);
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

}

 
