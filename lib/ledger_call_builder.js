'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LedgerCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#ledgers}.
 *
 * @see [All Ledgers](https://www.stellar.org/developers/horizon/reference/ledgers-all.html)
 * @constructor
 * @class LedgerCallBuilder
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
var LedgerCallBuilder = exports.LedgerCallBuilder = function (_CallBuilder) {
  _inherits(LedgerCallBuilder, _CallBuilder);

  function LedgerCallBuilder(serverUrl) {
    _classCallCheck(this, LedgerCallBuilder);

    var _this = _possibleConstructorReturn(this, (LedgerCallBuilder.__proto__ || Object.getPrototypeOf(LedgerCallBuilder)).call(this, serverUrl));

    _this.url.segment('ledgers');
    return _this;
  }

  /**
   * Provides information on a single ledger.
   * @param {number|string} sequence Ledger sequence
   * @returns {LedgerCallBuilder} current LedgerCallBuilder instance
   */


  _createClass(LedgerCallBuilder, [{
    key: 'ledger',
    value: function ledger(sequence) {
      this.filter.push(['ledgers', sequence.toString()]);
      return this;
    }
  }]);

  return LedgerCallBuilder;
}(_call_builder.CallBuilder);