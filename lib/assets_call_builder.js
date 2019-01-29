'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AssetsCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link AssetsCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#assets}.
 * @class AssetsCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
var AssetsCallBuilder = exports.AssetsCallBuilder = function (_CallBuilder) {
  _inherits(AssetsCallBuilder, _CallBuilder);

  function AssetsCallBuilder(serverUrl) {
    _classCallCheck(this, AssetsCallBuilder);

    var _this = _possibleConstructorReturn(this, (AssetsCallBuilder.__proto__ || Object.getPrototypeOf(AssetsCallBuilder)).call(this, serverUrl));

    _this.url.segment('assets');
    return _this;
  }

  /**
   * This endpoint filters all assets by the asset code.
   * @param {string} value For example: `USD`
   * @returns {AssetsCallBuilder} current AssetCallBuilder instance
   */


  _createClass(AssetsCallBuilder, [{
    key: 'forCode',
    value: function forCode(value) {
      this.url.setQuery('asset_code', value);
      return this;
    }

    /**
     * This endpoint filters all assets by the asset issuer.
     * @param {string} value For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {AssetsCallBuilder} current AssetCallBuilder instance
     */

  }, {
    key: 'forIssuer',
    value: function forIssuer(value) {
      this.url.setQuery('asset_issuer', value);
      return this;
    }
  }]);

  return AssetsCallBuilder;
}(_call_builder.CallBuilder);