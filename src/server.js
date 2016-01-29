import {NotFoundError, NetworkError, BadRequestError} from "./errors";

import {AccountCallBuilder} from "./account_call_builder";
import {LedgerCallBuilder} from "./ledger_call_builder";
import {TransactionCallBuilder} from "./transaction_call_builder";
import {OperationCallBuilder} from "./operation_call_builder";
import {OfferCallBuilder} from "./offer_call_builder";
import {OrderbookCallBuilder} from "./orderbook_call_builder";
import {PathCallBuilder} from "./path_call_builder";
import {PaymentCallBuilder} from "./payment_call_builder";
import {EffectCallBuilder} from "./effect_call_builder";
import {FriendbotBuilder} from "./friendbot_builder";
import {xdr, Account} from "stellar-base";

import {isString} from "lodash";

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let URI = require("URIjs");
let URITemplate = require("URIjs").URITemplate;

export const SUBMIT_TRANSACTION_TIMEOUT = 20*1000;

export class Server {
    /**
     * Server handles a network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
     * instance and exposes an interface for requests to that instance.
     * @constructor
     * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`). The old method (config object parameter) is **deprecated**.
     */
    constructor(serverURL={}) {
        if (isString(serverURL)) {
            this.serverURL = URI(serverURL);
        } else {
            // We leave the old method for compatibility reasons.
            // This will be removed in the next major release.
            this.protocol = serverURL.secure ? "https" : "http";
            this.hostname = serverURL.hostname || "localhost";
            this.port = serverURL.port || 3000;
            this.serverURL = URI({ protocol: this.protocol,
                hostname: this.hostname,
                port: this.port });
        }
    }

    /**
     * Submits a transaction to the network.
     * @see [Post Transaction](https://www.stellar.org/developers/horizon/reference/transactions-create.html)
     * @param {Transaction} transaction - The transaction to submit.
     * @returns {Promise} Promise that resolves or rejects with response from horizon.
     */
    submitTransaction(transaction) {
        let tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
        var promise = axios.post(
              URI(this.serverURL).path('transactions').toString(),
              `tx=${tx}`,
              {timeout: SUBMIT_TRANSACTION_TIMEOUT}
            )
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
     * Returns new {@link AccountCallBuilder} object configured by a current Horizon server configuration.
     * @returns {AccountCallBuilder}
     */
    accounts() {
        return new AccountCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
     * @returns {LedgerCallBuilder}
     */
    ledgers() {
        return new LedgerCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
     * @returns {TransactionCallBuilder}
     */
    transactions() {
        return new TransactionCallBuilder(URI(this.serverURL));
    }

    /**
     * People on the Stellar network can make offers to buy or sell assets. This endpoint represents all the offers a particular account makes.
     * Currently this method only supports querying offers for account and should be used like this:
     * ```
     * server.offers('accounts', accountId)
     *  .then(function(offers) {
     *    console.log(offers);
     *  });
     * ```
     * @param {string} resource Resource to query offers
     * @param {...string} resourceParams Parameters for selected resource
     * @returns OfferCallBuilder
     */
    offers(resource, ...resourceParams) {
        return new OfferCallBuilder(URI(this.serverURL), resource, ...resourceParams);
    }

    /**
     * Returns new {@link OrderbookCallBuilder} object configured by a current Horizon server configuration.
     * @param {Asset} selling Asset being sold
     * @param {Asset} buying Asset being bought
     * @returns {OrderbookCallBuilder}
     */
    orderbook(selling, buying) {
        return new OrderbookCallBuilder(URI(this.serverURL), selling, buying);
    }

    /**
     * Returns new {@link OperationCallBuilder} object configured by a current Horizon server configuration.
     * @returns {OperationCallBuilder}
     */
    operations() {
        return new OperationCallBuilder(URI(this.serverURL));
    }

    /**
     * The Stellar Network allows payments to be made across assets through path payments. A path payment specifies a
     * series of assets to route a payment through, from source asset (the asset debited from the payer) to destination
     * asset (the asset credited to the payee).
     *
     * A path search is specified using:
     *
     * * The destination address
     * * The source address
     * * The asset and amount that the destination account should receive
     *
     * As part of the search, horizon will load a list of assets available to the source address and will find any
     * payment paths from those source assets to the desired destination asset. The search's amount parameter will be
     * used to determine if there a given path can satisfy a payment of the desired amount.
     *
     * Returns new {@link PathCallBuilder} object configured by a current Horizon server configuration.
     *
     * @param {string} source The sender's account ID. Any returned path must use a source that the sender can hold.
     * @param {string} destination The destination account ID that any returned path should use.
     * @param {Asset} destinationAsset The destination asset.
     * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
     * @returns {@link PathCallBuilder}
     */
    paths(source, destination, destinationAsset, destinationAmount) {
        return new PathCallBuilder(URI(this.serverURL), source, destination, destinationAsset, destinationAmount);
    }

    /**
     * Returns new {@link PaymentCallBuilder} object configured by a current Horizon server configuration.
     * @returns {PaymentCallBuilder}
     */
    payments() {
        return new PaymentCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link EffectCallBuilder} object configured by a current Horizon server configuration.
     * @returns {EffectCallBuilder}
     */
    effects() {
        return new EffectCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link FriendbotBuilder} object configured by a current Horizon server configuration.
     * @returns {FriendbotBuilder}
     * @private
     */
    friendbot(address) {
        return new FriendbotBuilder(URI(this.serverURL), address);
    }

    /**
    * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
    * @param {string} accountId - The account to load.
    * @returns {Promise} Returns a promise to the {@link Account} object with populated sequence number.
    */
    loadAccount(accountId) {
        return this.accounts()
            .accountId(accountId)
            .call()
            .then(function (res) {
                return new Account(accountId, res.sequence);
            });
    }

}

 
