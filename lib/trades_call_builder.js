'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TradesCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link TradesCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#trades}.
 *
 * @class TradesCallBuilder
 * @extends CallBuilder
 * @constructor
 * @see [Trades](https://www.stellar.org/developers/horizon/reference/endpoints/trades.html)
 * @param {string} serverUrl serverUrl Horizon server URL.
 */
var TradesCallBuilder = exports.TradesCallBuilder = function (_CallBuilder) {
  _inherits(TradesCallBuilder, _CallBuilder);

  function TradesCallBuilder(serverUrl) {
    _classCallCheck(this, TradesCallBuilder);

    var _this = _possibleConstructorReturn(this, (TradesCallBuilder.__proto__ || Object.getPrototypeOf(TradesCallBuilder)).call(this, serverUrl));

    _this.url.segment('trades');
    return _this;
  }

  /**
   * Filter trades for a specific asset pair (orderbook)
   * @param {Asset} base asset
   * @param {Asset} counter asset
   * @returns {TradesCallBuilder} current TradesCallBuilder instance
   */


  _createClass(TradesCallBuilder, [{
    key: 'forAssetPair',
    value: function forAssetPair(base, counter) {
      if (!base.isNative()) {
        this.url.setQuery('base_asset_type', base.getAssetType());
        this.url.setQuery('base_asset_code', base.getCode());
        this.url.setQuery('base_asset_issuer', base.getIssuer());
      } else {
        this.url.setQuery('base_asset_type', 'native');
      }
      if (!counter.isNative()) {
        this.url.setQuery('counter_asset_type', counter.getAssetType());
        this.url.setQuery('counter_asset_code', counter.getCode());
        this.url.setQuery('counter_asset_issuer', counter.getIssuer());
      } else {
        this.url.setQuery('counter_asset_type', 'native');
      }
      return this;
    }

    /**
     * Filter trades for a specific offer
     * @param {string} offerId ID of the offer
     * @returns {TradesCallBuilder} current TradesCallBuilder instance
     */

  }, {
    key: 'forOffer',
    value: function forOffer(offerId) {
      this.url.setQuery('offer_id', offerId);
      return this;
    }

    /**
     * Filter trades for a specific account
     * @see [Trades for Account](https://www.stellar.org/developers/horizon/reference/trades-for-account.html)
     * @param {string} accountId For example: `GBYTR4MC5JAX4ALGUBJD7EIKZVM7CUGWKXIUJMRSMK573XH2O7VAK3SR`
     * @returns {TradesCallBuilder} current TradesCallBuilder instance
     */

  }, {
    key: 'forAccount',
    value: function forAccount(accountId) {
      this.filter.push(['accounts', accountId, 'trades']);
      return this;
    }
  }]);

  return TradesCallBuilder;
}(_call_builder.CallBuilder);