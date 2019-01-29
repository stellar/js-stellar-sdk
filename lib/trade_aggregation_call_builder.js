'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TradeAggregationCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

var _errors = require('./errors');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var allowedResolutions = [60000, 300000, 900000, 3600000, 86400000, 604800000];

/**
 * Trade Aggregations facilitate efficient gathering of historical trade data.
 * Do not create this object directly, use {@link Server#tradeAggregation}.
 *
 * @class TradeAggregationCallBuilder
 * @extends CallBuilder
 * @constructor
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} base base asset
 * @param {Asset} counter counter asset
 * @param {long} start_time lower time boundary represented as millis since epoch
 * @param {long} end_time upper time boundary represented as millis since epoch
 * @param {long} resolution segment duration as millis since epoch. *Supported values are 1 minute (60000), 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
 * @param {long} offset segments can be offset using this parameter. Expressed in milliseconds. *Can only be used if the resolution is greater than 1 hour. Value must be in whole hours, less than the provided resolution, and less than 24 hours.
 */

var TradeAggregationCallBuilder = exports.TradeAggregationCallBuilder = function (_CallBuilder) {
  _inherits(TradeAggregationCallBuilder, _CallBuilder);

  function TradeAggregationCallBuilder(serverUrl, base, counter, start_time, end_time, resolution, offset) {
    _classCallCheck(this, TradeAggregationCallBuilder);

    var _this = _possibleConstructorReturn(this, (TradeAggregationCallBuilder.__proto__ || Object.getPrototypeOf(TradeAggregationCallBuilder)).call(this, serverUrl));

    _this.url.segment('trade_aggregations');
    if (!base.isNative()) {
      _this.url.setQuery('base_asset_type', base.getAssetType());
      _this.url.setQuery('base_asset_code', base.getCode());
      _this.url.setQuery('base_asset_issuer', base.getIssuer());
    } else {
      _this.url.setQuery('base_asset_type', 'native');
    }
    if (!counter.isNative()) {
      _this.url.setQuery('counter_asset_type', counter.getAssetType());
      _this.url.setQuery('counter_asset_code', counter.getCode());
      _this.url.setQuery('counter_asset_issuer', counter.getIssuer());
    } else {
      _this.url.setQuery('counter_asset_type', 'native');
    }
    if (typeof start_time === 'undefined' || typeof end_time === 'undefined') {
      throw new _errors.BadRequestError('Invalid time bounds', [start_time, end_time]);
    } else {
      _this.url.setQuery('start_time', start_time);
      _this.url.setQuery('end_time', end_time);
    }
    if (!_this.isValidResolution(resolution)) {
      throw new _errors.BadRequestError('Invalid resolution', resolution);
    } else {
      _this.url.setQuery('resolution', resolution);
    }
    if (!_this.isValidOffset(offset, resolution)) {
      throw new _errors.BadRequestError('Invalid offset', offset);
    } else {
      _this.url.setQuery('offset', offset);
    }
    return _this;
  }

  /**
   * @private
   * @param {long} resolution Trade data resolution in milliseconds
   * @returns {boolean} true if the resolution is allowed
   */


  _createClass(TradeAggregationCallBuilder, [{
    key: 'isValidResolution',
    value: function isValidResolution(resolution) {
      var found = false;

      for (var i = 0; i < allowedResolutions.length; i += 1) {
        if (allowedResolutions[i] === resolution) {
          found = true;
          break;
        }
      }
      return found;
    }

    /**
     * @private
     * @param {long} offset Time offset in milliseconds
     * @param {long} resolution Trade data resolution in milliseconds
     * @returns {boolean} true if the offset is valid
     */

  }, {
    key: 'isValidOffset',
    value: function isValidOffset(offset, resolution) {
      var hour = 3600000;
      return !(offset > resolution || offset >= 24 * hour || offset % hour !== 0);
    }
  }]);

  return TradeAggregationCallBuilder;
}(_call_builder.CallBuilder);