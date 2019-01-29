'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = exports.SUBMIT_TRANSACTION_TIMEOUT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _errors = require('./errors');

var _account_call_builder = require('./account_call_builder');

var _account_response = require('./account_response');

var _config = require('./config');

var _ledger_call_builder = require('./ledger_call_builder');

var _transaction_call_builder = require('./transaction_call_builder');

var _operation_call_builder = require('./operation_call_builder');

var _offer_call_builder = require('./offer_call_builder');

var _orderbook_call_builder = require('./orderbook_call_builder');

var _trades_call_builder = require('./trades_call_builder');

var _path_call_builder = require('./path_call_builder');

var _payment_call_builder = require('./payment_call_builder');

var _effect_call_builder = require('./effect_call_builder');

var _friendbot_builder = require('./friendbot_builder');

var _assets_call_builder = require('./assets_call_builder');

var _trade_aggregation_call_builder = require('./trade_aggregation_call_builder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SUBMIT_TRANSACTION_TIMEOUT = exports.SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

/**
 * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
 * instance and exposes an interface for requests to that instance.
 * @constructor
 * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 */

var Server = exports.Server = function () {
  function Server(serverURL) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Server);

    this.serverURL = (0, _urijs2.default)(serverURL);

    var allowHttp = _config.Config.isAllowHttp();
    if (typeof opts.allowHttp !== 'undefined') {
      allowHttp = opts.allowHttp;
    }

    if (this.serverURL.protocol() !== 'https' && !allowHttp) {
      throw new Error('Cannot connect to insecure horizon server');
    }
  }

  /**
   * Submits a transaction to the network.
   * @see [Post Transaction](https://www.stellar.org/developers/horizon/reference/transactions-create.html)
   * @param {Transaction} transaction - The transaction to submit.
   * @returns {Promise} Promise that resolves or rejects with response from horizon.
   */


  _createClass(Server, [{
    key: 'submitTransaction',
    value: function submitTransaction(transaction) {
      var tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString('base64'));
      return _axios2.default.post((0, _urijs2.default)(this.serverURL).segment('transactions').toString(), 'tx=' + tx, { timeout: SUBMIT_TRANSACTION_TIMEOUT }).then(function (response) {
        return response.data;
      }).catch(function (response) {
        if (response instanceof Error) {
          return Promise.reject(response);
        }
        return Promise.reject(new _errors.BadResponseError('Transaction submission failed. Server responded: ' + response.status + ' ' + response.statusText, response.data));
      });
    }

    /**
     * @returns {AccountCallBuilder} New {@link AccountCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'accounts',
    value: function accounts() {
      return new _account_call_builder.AccountCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * @returns {LedgerCallBuilder} New {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'ledgers',
    value: function ledgers() {
      return new _ledger_call_builder.LedgerCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * @returns {TransactionCallBuilder} New {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'transactions',
    value: function transactions() {
      return new _transaction_call_builder.TransactionCallBuilder((0, _urijs2.default)(this.serverURL));
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

  }, {
    key: 'offers',
    value: function offers(resource) {
      for (var _len = arguments.length, resourceParams = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        resourceParams[_key - 1] = arguments[_key];
      }

      return new (Function.prototype.bind.apply(_offer_call_builder.OfferCallBuilder, [null].concat([(0, _urijs2.default)(this.serverURL), resource], resourceParams)))();
    }

    /**
     * @param {Asset} selling Asset being sold
     * @param {Asset} buying Asset being bought
     * @returns {OrderbookCallBuilder} New {@link OrderbookCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'orderbook',
    value: function orderbook(selling, buying) {
      return new _orderbook_call_builder.OrderbookCallBuilder((0, _urijs2.default)(this.serverURL), selling, buying);
    }

    /**
     * Returns
     * @returns {TradesCallBuilder} New {@link TradesCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'trades',
    value: function trades() {
      return new _trades_call_builder.TradesCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * @returns {OperationCallBuilder} New {@link OperationCallBuilder} object configured by a current Horizon server configuration.
     */

  }, {
    key: 'operations',
    value: function operations() {
      return new _operation_call_builder.OperationCallBuilder((0, _urijs2.default)(this.serverURL));
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

  }, {
    key: 'paths',
    value: function paths(source, destination, destinationAsset, destinationAmount) {
      return new _path_call_builder.PathCallBuilder((0, _urijs2.default)(this.serverURL), source, destination, destinationAsset, destinationAmount);
    }

    /**
     * @returns {PaymentCallBuilder} New {@link PaymentCallBuilder} instance configured with the current
     * Horizon server configuration.
     */

  }, {
    key: 'payments',
    value: function payments() {
      return new _payment_call_builder.PaymentCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * @returns {EffectCallBuilder} New {@link EffectCallBuilder} instance configured with the current
     * Horizon server configuration
     */

  }, {
    key: 'effects',
    value: function effects() {
      return new _effect_call_builder.EffectCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * @param {string} address The Stellar ID that you want Friendbot to send lumens to
     * @returns {FriendbotBuilder} New {@link FriendbotBuilder} instance configured with the current
     * Horizon server configuration
     * @private
     */

  }, {
    key: 'friendbot',
    value: function friendbot(address) {
      return new _friendbot_builder.FriendbotBuilder((0, _urijs2.default)(this.serverURL), address);
    }

    /**
     * Get a new {@link AssetsCallBuilder} instance configured with the current
     * Horizon server configuration.
     * @returns {AssetsCallBuilder} New AssetsCallBuilder instance
     */

  }, {
    key: 'assets',
    value: function assets() {
      return new _assets_call_builder.AssetsCallBuilder((0, _urijs2.default)(this.serverURL));
    }

    /**
     * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
     * @param {string} accountId - The account to load.
     * @returns {Promise} Returns a promise to the {@link AccountResponse} object with populated sequence number.
     */

  }, {
    key: 'loadAccount',
    value: function loadAccount(accountId) {
      return this.accounts().accountId(accountId).call().then(function (res) {
        return new _account_response.AccountResponse(res);
      });
    }

    /**
     *
     * @param {Asset} base base aseet
     * @param {Asset} counter counter asset
     * @param {long} start_time lower time boundary represented as millis since epoch
     * @param {long} end_time upper time boundary represented as millis since epoch
     * @param {long} resolution segment duration as millis since epoch. *Supported values are 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
     * @param {long} offset segments can be offset using this parameter. Expressed in milliseconds. *Can only be used if the resolution is greater than 1 hour. Value must be in whole hours, less than the provided resolution, and less than 24 hours.
     * Returns new {@link TradeAggregationCallBuilder} object configured with the current Horizon server configuration.
     * @returns {TradeAggregationCallBuilder} New TradeAggregationCallBuilder instance
     */

  }, {
    key: 'tradeAggregation',
    value: function tradeAggregation(base, counter, start_time, end_time, resolution, offset) {
      return new _trade_aggregation_call_builder.TradeAggregationCallBuilder((0, _urijs2.default)(this.serverURL), base, counter, start_time, end_time, resolution, offset);
    }
  }]);

  return Server;
}();