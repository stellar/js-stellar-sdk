'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OrderbookCallBuilder = undefined;

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link OrderbookCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#orderbook}.
 * @see [Orderbook Details](https://www.stellar.org/developers/horizon/reference/orderbook-details.html)
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} selling Asset being sold
 * @param {Asset} buying Asset being bought
 */
var OrderbookCallBuilder = exports.OrderbookCallBuilder = function (_CallBuilder) {
  _inherits(OrderbookCallBuilder, _CallBuilder);

  function OrderbookCallBuilder(serverUrl, selling, buying) {
    _classCallCheck(this, OrderbookCallBuilder);

    var _this = _possibleConstructorReturn(this, (OrderbookCallBuilder.__proto__ || Object.getPrototypeOf(OrderbookCallBuilder)).call(this, serverUrl));

    _this.url.segment('order_book');
    if (!selling.isNative()) {
      _this.url.setQuery('selling_asset_type', selling.getAssetType());
      _this.url.setQuery('selling_asset_code', selling.getCode());
      _this.url.setQuery('selling_asset_issuer', selling.getIssuer());
    } else {
      _this.url.setQuery('selling_asset_type', 'native');
    }
    if (!buying.isNative()) {
      _this.url.setQuery('buying_asset_type', buying.getAssetType());
      _this.url.setQuery('buying_asset_code', buying.getCode());
      _this.url.setQuery('buying_asset_issuer', buying.getIssuer());
    } else {
      _this.url.setQuery('buying_asset_type', 'native');
    }
    return _this;
  }

  return OrderbookCallBuilder;
}(_call_builder.CallBuilder);