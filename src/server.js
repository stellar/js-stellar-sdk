import {NotFoundError, NetworkError, BadRequestError, BadResponseError} from "./errors";

import {AccountCallBuilder} from "./account_call_builder";
import {AccountResponse} from "./account_response";
import {Config} from "./config";
import {LedgerCallBuilder} from "./ledger_call_builder";
import {TransactionCallBuilder} from "./transaction_call_builder";
import {OperationCallBuilder} from "./operation_call_builder";
import {OfferCallBuilder} from "./offer_call_builder";
import {OrderbookCallBuilder} from "./orderbook_call_builder";
import {TradesCallBuilder} from "./trades_call_builder";
import {PathCallBuilder} from "./path_call_builder";
import {PaymentCallBuilder} from "./payment_call_builder";
import {EffectCallBuilder} from "./effect_call_builder";
import {FriendbotBuilder} from "./friendbot_builder";
import {AssetsCallBuilder} from "./assets_call_builder";
import { TradeAggregationCallBuilder } from "./trade_aggregation_call_builder";
import {xdr} from "stellar-base";
import isString from "lodash/isString";

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let URI = require("urijs");
let URITemplate = require("urijs").URITemplate;

export const SUBMIT_TRANSACTION_TIMEOUT = 60*1000;

/**
 * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
 * instance and exposes an interface for requests to that instance.
 * @constructor
 * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
 * @param {object} [opts]
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 */
export class Server {
    constructor(serverURL, opts = {}) {
        this.serverURL = URI(serverURL);

        let allowHttp = Config.isAllowHttp();
        if (typeof opts.allowHttp !== 'undefined') {
            allowHttp = opts.allowHttp;
        }

        if (this.serverURL.protocol() != 'https' && !allowHttp) {
            throw new Error('Cannot connect to insecure horizon server');
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
              URI(this.serverURL).segment('transactions').toString(),
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
                    return Promise.reject(new BadResponseError(`Transaction submission failed. Server responded: ${response.status} ${response.statusText}`, response.data));
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
     * server.offers('accounts', accountId).call()
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
     * Returns new {@link TradesCallBuilder} object configured by a current Horizon server configuration.
     * @returns {TradesCallBuilder}
     */
    trades() {
        return new TradesCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link OperationCallBuilder} object configured by a current Horizon server configuration.
     * @returns {OperationCallBuilder}
     */
    operations() {
        return new OperationCallBuilder(URI(this.serverURL));
    }

    /**
     * The Stellar Network allows payments to be made between assets through path payments. A path payment specifies a
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
     * Returns new {@link PathCallBuilder} object configured with the current Horizon server configuration.
     *
     * @param {string} source The sender's account ID. Any returned path will use a source that the sender can hold.
     * @param {string} destination The destination account ID that any returned path should use.
     * @param {Asset} destinationAsset The destination asset.
     * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
     * @returns {@link PathCallBuilder}
     */
    paths(source, destination, destinationAsset, destinationAmount) {
        return new PathCallBuilder(URI(this.serverURL), source, destination, destinationAsset, destinationAmount);
    }

    /**
     * Returns new {@link PaymentCallBuilder} object configured with the current Horizon server configuration.
     * @returns {PaymentCallBuilder}
     */
    payments() {
        return new PaymentCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link EffectCallBuilder} object configured with the current Horizon server configuration.
     * @returns {EffectCallBuilder}
     */
    effects() {
        return new EffectCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link FriendbotBuilder} object configured with the current Horizon server configuration.
     * @returns {FriendbotBuilder}
     * @private
     */
    friendbot(address) {
        return new FriendbotBuilder(URI(this.serverURL), address);
    }

    /**
     * Returns new {@link AssetsCallBuilder} object configured with the current Horizon server configuration.
     * @returns {AssetsCallBuilder}
     */
    assets() {
        return new AssetsCallBuilder(URI(this.serverURL));
    }


    /**
    * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
    * @param {string} accountId - The account to load.
    * @returns {Promise} Returns a promise to the {@link AccountResponse} object with populated sequence number.
    */
    loadAccount(accountId) {
        return this.accounts()
            .accountId(accountId)
            .call()
            .then(function (res) {
                return new AccountResponse(res);
            });
    }

    /**
     * 
     * @param {Asset} base base aseet
     * @param {Asset} counter counter asset
     * @param {long} start_time lower time boundary represented as millis since epoch
     * @param {long} end_time upper time boundary represented as millis since epoch
     * @param {long} resolution segment duration as millis since epoch. *Supported values are 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
     * Returns new {@link TradeAggregationCallBuilder} object configured with the current Horizon server configuration.
     * @returns {TradeAggregationCallBuilder}
     */
    tradeAggregation(base, counter, start_time, end_time, resolution){
        return new TradeAggregationCallBuilder(URI(this.serverURL), base, counter, start_time, end_time, resolution);
    }
}
