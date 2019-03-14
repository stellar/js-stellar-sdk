import URI from 'urijs';
import { xdr, StrKey, Asset } from 'stellar-base';
import BigNumber from 'bignumber.js';

import { BadResponseError } from './errors';

import { AccountCallBuilder } from './account_call_builder';
import { AccountResponse } from './account_response';
import { CallBuilder } from './call_builder';
import { Config } from './config';
import HorizonAxiosClient, {
  getCurrentServerTime
} from './horizon_axios_client';
import { LedgerCallBuilder } from './ledger_call_builder';
import { TransactionCallBuilder } from './transaction_call_builder';
import { OperationCallBuilder } from './operation_call_builder';
import { OfferCallBuilder } from './offer_call_builder';
import { OrderbookCallBuilder } from './orderbook_call_builder';
import { TradesCallBuilder } from './trades_call_builder';
import { PathCallBuilder } from './path_call_builder';
import { PaymentCallBuilder } from './payment_call_builder';
import { EffectCallBuilder } from './effect_call_builder';
import { FriendbotBuilder } from './friendbot_builder';
import { AssetsCallBuilder } from './assets_call_builder';
import { TradeAggregationCallBuilder } from './trade_aggregation_call_builder';

export const SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

const STROOPS_IN_LUMEN = 10000000;

function _getAmountInLumens(amt) {
  return new BigNumber(amt).div(STROOPS_IN_LUMEN).toString();
}

/**
 * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
 * instance and exposes an interface for requests to that instance.
 * @constructor
 * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 */
export class Server {
  constructor(serverURL, opts = {}) {
    this.serverURL = URI(serverURL);

    let allowHttp = Config.isAllowHttp();
    if (typeof opts.allowHttp !== 'undefined') {
      allowHttp = opts.allowHttp;
    }

    if (this.serverURL.protocol() !== 'https' && !allowHttp) {
      throw new Error('Cannot connect to insecure horizon server');
    }
  }

  /**
   * Get timebounds for N seconds from now, when you're creating a transaction
   * with {@link TransactionBuilder}.
   *
   * By default, {@link TransactionBuilder} uses the current local time, but
   * your machine's local time could be different from Horizon's. This gives you
   * more assurance that your timebounds will reflect what you want.
   *
   * Note that this will generate your timebounds when you **run the function**,
   * not when you submit the function! So give yourself enough time to get
   * the transaction built and signed before submitting.
   *
   * Example:
   *
   * ```javascript
   * const transaction = new StellarSdk.TransactionBuilder(accountId, {
   *  fee: await StellarSdk.Server.fetchBaseFee(),
   *  timebounds: await StellarSdk.Server.fetchTimebounds(100)
   * })
   *  .addOperation(operation)
   *  // normally we would need to call setTimeout here, but setting timebounds
   *  // earlier does the trick!
   *  .build();
   * ```
   * @argument {number} seconds Number of seconds past the current time to wait.
   * @argument {bool} [_isRetry=false] True if this is a retry. Only set this internally!
   * This is to avoid a scenario where Horizon is horking up the wrong date.
   * @returns {Promise<number>} Promise that resolves a `timebounds` object
   * (with the shape `{ minTime: 0, maxTime: N }`) that you can set the `timebounds` option to.
   */
  fetchTimebounds(seconds, _isRetry = false) {
    // HorizonAxiosClient instead of this.ledgers so we can get at them headers
    const currentTime = getCurrentServerTime(this.serverURL.hostname());

    if (currentTime) {
      return Promise.resolve({
        minTime: 0,
        maxTime: currentTime + seconds
      });
    }

    // if this is a retry, then the retry has failed, so use local time
    if (_isRetry) {
      return Promise.resolve({
        minTime: 0,
        maxTime: Math.floor(new Date().getTime() / 1000) + seconds
      });
    }

    // otherwise, retry (by calling the fee endpoint)
    return HorizonAxiosClient.get(`${URI(this.serverURL)}/fee_stats`).then(() =>
      this.fetchTimebounds(seconds, true)
    );
  }

  /**
   * Fetch the base fee. Since this hits the server, if the server call fails,
   * you might get an error. You should be prepared to use a default value if
   * that happens!
   * @returns {Promise<number>} Promise that resolves to the base fee.
   */
  fetchBaseFee() {
    return this.ledgers()
      .order('desc')
      .limit(1)
      .call()
      .then((response) => {
        if (response && response.records[0]) {
          return response.records[0].base_fee_in_stroops || 100;
        }
        return 100;
      });
  }

  /**
   * Fetch the operation fee stats endpoint.
   * @see [Operation Fee Stats](https://www.stellar.org/developers/horizon/reference/operation-fee-stats.html)
   * @returns {Promise} Promise that resolves to the fee stats returned by Horizon.
   */
  operationFeeStats() {
    const cb = new CallBuilder(URI(this.serverURL));
    cb.filter.push(['operation_fee_stats']);
    return cb.call();
  }

  /**
   * Submits a transaction to the network.
   *
   * If you submit any number of `manageOffer` operations, this will add
   * an attribute to the response that will help you analyze what happened
   * with your offers.
   *
   * Ex:
   * ```javascript
   * const res = {
   *   ...response,
   *   offerResults: [
   *     {
   *       // Exact ordered list of offers that executed, with the exception
   *       // that the last one may not have executed entirely.
   *       offersClaimed: [
   *         sellerId: String,
   *         offerId: String,
   *         assetSold: {
   *           type: 'native|credit_alphanum4|credit_alphanum12',
   *
   *           // these are only present if the asset is not native
   *           assetCode: String,
   *           issuer: String,
   *         },
   *
   *         // same shape as assetSold
   *         assetBought: {}
   *       ],
   *
   *       // What effect your manageOffer op had
   *       effect: "manageOfferCreated|manageOfferUpdated|manageOfferDeleted",
   *
   *       // Whether your offer immediately got matched and filled
   *       wasImmediatelyFilled: Boolean,
   *
   *       // Whether your offer immediately got deleted, if for example the order was too small
   *       wasImmediatelyDeleted: Boolean,
   *
   *       // Whether the offer was partially, but not completely, filled
   *       wasPartiallyFilled: Boolean,
   *
   *       // The full requested amount of the offer is open for matching
   *       isFullyOpen: Boolean,
   *
   *       // The total amount of tokens bought / sold during transaction execution
   *       amountBought: Number,
   *       amountSold: Number,
   *
   *       // if the offer was created, updated, or partially filled, this is
   *       // the outstanding offer
   *       currentOffer: {
   *         offerId: String,
   *         amount: String,
   *         price: {
   *           n: String,
   *           d: String,
   *         },
   *
   *         selling: {
   *           type: 'native|credit_alphanum4|credit_alphanum12',
   *
   *           // these are only present if the asset is not native
   *           assetCode: String,
   *           issuer: String,
   *         },
   *
   *         // same as `selling`
   *         buying: {},
   *       },
   *
   *       // the index of this particular operation in the op stack
   *       operationIndex: Number
   *     }
   *   ]
   * }
   * ```
   *
   * For example, you'll want to examine `offerResults` to add affordances
   * like these to your app:
   * * If `wasImmediatelyFilled` is true, then no offer was created. So if you
   * normally watch the `Server.offers` endpoint for offer updates, you instead
   * need to check `Server.trades` to find the result of this filled offer.
   * * If `wasImmediatelyDeleted` is true, then the offer you submitted was
   * deleted without reaching the orderbook or being matched (possibly because
   * your amounts were rounded down to zero). So treat the just-submitted offer
   * request as if it never happened.
   * * If `wasPartiallyFilled` is true, you can tell the user that `amountBought`
   * or `amountSold` have already been transferred.
   *
   * @see [Post Transaction](https://www.stellar.org/developers/horizon/reference/transactions-create.html)
   * @param {Transaction} transaction - The transaction to submit.
   * @returns {Promise} Promise that resolves or rejects with response from horizon.
   */
  submitTransaction(transaction) {
    const tx = encodeURIComponent(
      transaction
        .toEnvelope()
        .toXDR()
        .toString('base64')
    );

    return HorizonAxiosClient.post(
      URI(this.serverURL)
        .segment('transactions')
        .toString(),
      `tx=${tx}`,
      { timeout: SUBMIT_TRANSACTION_TIMEOUT }
    )
      .then((response) => {
        if (!response.data.result_xdr) {
          return response.data;
        }

        const responseXDR = xdr.TransactionResult.fromXDR(
          response.data.result_xdr,
          'base64'
        );

        const results = responseXDR.result().value();

        let offerResults;
        let hasManageOffer;

        if (results.length) {
          offerResults = results
            .map((result, i) => {
              if (result.value().switch().name !== 'manageOffer') {
                return null;
              }

              hasManageOffer = true;

              let amountBought = new BigNumber(0);
              let amountSold = new BigNumber(0);

              const offerSuccess = result
                .value()
                .value()
                .success();

              const offersClaimed = offerSuccess
                .offersClaimed()
                .map((offerClaimed) => {
                  const claimedOfferAmountBought = new BigNumber(
                    // amountBought is a js-xdr hyper
                    offerClaimed.amountBought().toString()
                  );
                  const claimedOfferAmountSold = new BigNumber(
                    // amountBought is a js-xdr hyper
                    offerClaimed.amountSold().toString()
                  );

                  // This is an offer that was filled by the one just submitted.
                  // So this offer has an _opposite_ bought/sold frame of ref
                  // than from what we just submitted!
                  // So add this claimed offer's bought to the SOLD count and vice v

                  amountBought = amountBought.add(claimedOfferAmountSold);
                  amountSold = amountSold.add(claimedOfferAmountBought);

                  const sold = Asset.fromOperation(offerClaimed.assetSold());
                  const bought = Asset.fromOperation(
                    offerClaimed.assetBought()
                  );

                  const assetSold = {
                    type: sold.getAssetType(),
                    assetCode: sold.getCode(),
                    issuer: sold.getIssuer()
                  };

                  const assetBought = {
                    type: bought.getAssetType(),
                    assetCode: bought.getCode(),
                    issuer: bought.getIssuer()
                  };

                  return {
                    sellerId: StrKey.encodeEd25519PublicKey(
                      offerClaimed.sellerId().ed25519()
                    ),
                    offerId: offerClaimed.offerId().toString(),
                    assetSold,
                    amountSold: _getAmountInLumens(claimedOfferAmountSold),
                    assetBought,
                    amountBought: _getAmountInLumens(claimedOfferAmountBought)
                  };
                });

              const effect = offerSuccess.offer().switch().name;

              let currentOffer;

              if (
                typeof offerSuccess.offer().value === 'function' &&
                offerSuccess.offer().value()
              ) {
                const offerXDR = offerSuccess.offer().value();

                currentOffer = {
                  offerId: offerXDR.offerId().toString(),
                  selling: {},
                  buying: {},
                  amount: _getAmountInLumens(offerXDR.amount().toString()),
                  price: {
                    n: offerXDR.price().n(),
                    d: offerXDR.price().d()
                  }
                };

                const selling = Asset.fromOperation(offerXDR.selling());

                currentOffer.selling = {
                  type: selling.getAssetType(),
                  assetCode: selling.getCode(),
                  issuer: selling.getIssuer()
                };

                const buying = Asset.fromOperation(offerXDR.buying());

                currentOffer.buying = {
                  type: buying.getAssetType(),
                  assetCode: buying.getCode(),
                  issuer: buying.getIssuer()
                };
              }

              return {
                offersClaimed,
                effect,
                operationIndex: i,
                currentOffer,

                // this value is in stroops so divide it out
                amountBought: _getAmountInLumens(amountBought),
                amountSold: _getAmountInLumens(amountSold),

                isFullyOpen:
                  !offersClaimed.length && effect !== 'manageOfferDeleted',
                wasPartiallyFilled:
                  !!offersClaimed.length && effect !== 'manageOfferDeleted',
                wasImmediatelyFilled:
                  !!offersClaimed.length && effect === 'manageOfferDeleted',
                wasImmediatelyDeleted:
                  !offersClaimed.length && effect === 'manageOfferDeleted'
              };
            })
            .filter((result) => !!result);
        }

        return Object.assign({}, response.data, {
          offerResults: hasManageOffer ? offerResults : undefined
        });
      })
      .catch((response) => {
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        return Promise.reject(
          new BadResponseError(
            `Transaction submission failed. Server responded: ${
              response.status
            } ${response.statusText}`,
            response.data
          )
        );
      });
  }

  /**
   * @returns {AccountCallBuilder} New {@link AccountCallBuilder} object configured by a current Horizon server configuration.
   */
  accounts() {
    return new AccountCallBuilder(URI(this.serverURL));
  }

  /**
   * @returns {LedgerCallBuilder} New {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
   */
  ledgers() {
    return new LedgerCallBuilder(URI(this.serverURL));
  }

  /**
   * @returns {TransactionCallBuilder} New {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
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
   * @returns {OfferCallBuilder} New {@link OfferCallBuilder} object
   */
  offers(resource, ...resourceParams) {
    return new OfferCallBuilder(
      URI(this.serverURL),
      resource,
      ...resourceParams
    );
  }

  /**
   * @param {Asset} selling Asset being sold
   * @param {Asset} buying Asset being bought
   * @returns {OrderbookCallBuilder} New {@link OrderbookCallBuilder} object configured by a current Horizon server configuration.
   */
  orderbook(selling, buying) {
    return new OrderbookCallBuilder(URI(this.serverURL), selling, buying);
  }

  /**
   * Returns
   * @returns {TradesCallBuilder} New {@link TradesCallBuilder} object configured by a current Horizon server configuration.
   */
  trades() {
    return new TradesCallBuilder(URI(this.serverURL));
  }

  /**
   * @returns {OperationCallBuilder} New {@link OperationCallBuilder} object configured by a current Horizon server configuration.
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
   * @param {string} source The sender's account ID. Any returned path will use a source that the sender can hold.
   * @param {string} destination The destination account ID that any returned path should use.
   * @param {Asset} destinationAsset The destination asset.
   * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
   * @returns {PathCallBuilder} New {@link PathCallBuilder} object configured with the current Horizon server configuration.
   */
  paths(source, destination, destinationAsset, destinationAmount) {
    return new PathCallBuilder(
      URI(this.serverURL),
      source,
      destination,
      destinationAsset,
      destinationAmount
    );
  }

  /**
   * @returns {PaymentCallBuilder} New {@link PaymentCallBuilder} instance configured with the current
   * Horizon server configuration.
   */
  payments() {
    return new PaymentCallBuilder(URI(this.serverURL));
  }

  /**
   * @returns {EffectCallBuilder} New {@link EffectCallBuilder} instance configured with the current
   * Horizon server configuration
   */
  effects() {
    return new EffectCallBuilder(URI(this.serverURL));
  }

  /**
   * @param {string} address The Stellar ID that you want Friendbot to send lumens to
   * @returns {FriendbotBuilder} New {@link FriendbotBuilder} instance configured with the current
   * Horizon server configuration
   * @private
   */
  friendbot(address) {
    return new FriendbotBuilder(URI(this.serverURL), address);
  }

  /**
   * Get a new {@link AssetsCallBuilder} instance configured with the current
   * Horizon server configuration.
   * @returns {AssetsCallBuilder} New AssetsCallBuilder instance
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
      .then((res) => new AccountResponse(res));
  }

  /**
   *
   * @param {Asset} base base asset
   * @param {Asset} counter counter asset
   * @param {long} start_time lower time boundary represented as millis since epoch
   * @param {long} end_time upper time boundary represented as millis since epoch
   * @param {long} resolution segment duration as millis since epoch. *Supported values are 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
   * @param {long} offset segments can be offset using this parameter. Expressed in milliseconds. *Can only be used if the resolution is greater than 1 hour. Value must be in whole hours, less than the provided resolution, and less than 24 hours.
   * Returns new {@link TradeAggregationCallBuilder} object configured with the current Horizon server configuration.
   * @returns {TradeAggregationCallBuilder} New TradeAggregationCallBuilder instance
   */
  tradeAggregation(base, counter, start_time, end_time, resolution, offset) {
    return new TradeAggregationCallBuilder(
      URI(this.serverURL),
      base,
      counter,
      start_time,
      end_time,
      resolution,
      offset
    );
  }
}
