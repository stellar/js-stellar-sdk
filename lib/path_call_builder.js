'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathCallBuilder = undefined;

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
 * Do not create this object directly, use {@link Server#paths}.
 * @see [Find Payment Paths](https://www.stellar.org/developers/horizon/reference/path-finding.html)
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {string} source The sender's account ID. Any returned path must use a source that the sender can hold.
 * @param {string} destination The destination account ID that any returned path should use.
 * @param {Asset} destinationAsset The destination asset.
 * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
 */
var PathCallBuilder = exports.PathCallBuilder = function (_CallBuilder) {
  _inherits(PathCallBuilder, _CallBuilder);

  function PathCallBuilder(serverUrl, source, destination, destinationAsset, destinationAmount) {
    _classCallCheck(this, PathCallBuilder);

    var _this = _possibleConstructorReturn(this, (PathCallBuilder.__proto__ || Object.getPrototypeOf(PathCallBuilder)).call(this, serverUrl));

    _this.url.segment('paths');
    _this.url.setQuery('destination_account', destination);
    _this.url.setQuery('source_account', source);
    _this.url.setQuery('destination_amount', destinationAmount);

    if (!destinationAsset.isNative()) {
      _this.url.setQuery('destination_asset_type', destinationAsset.getAssetType());
      _this.url.setQuery('destination_asset_code', destinationAsset.getCode());
      _this.url.setQuery('destination_asset_issuer', destinationAsset.getIssuer());
    } else {
      _this.url.setQuery('destination_asset_type', 'native');
    }
    return _this;
  }

  return PathCallBuilder;
}(_call_builder.CallBuilder);