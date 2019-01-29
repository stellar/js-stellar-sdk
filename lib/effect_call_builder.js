'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EffectCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link EffectCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#effects}.
 *
 * @class EffectCallBuilder
 * @extends CallBuilder
 * @see [All Effects](https://www.stellar.org/developers/horizon/reference/effects-all.html)
 * @constructor
 * @param {string} serverUrl Horizon server URL.
 */
var EffectCallBuilder = exports.EffectCallBuilder = function (_CallBuilder) {
  _inherits(EffectCallBuilder, _CallBuilder);

  function EffectCallBuilder(serverUrl) {
    _classCallCheck(this, EffectCallBuilder);

    var _this = _possibleConstructorReturn(this, (EffectCallBuilder.__proto__ || Object.getPrototypeOf(EffectCallBuilder)).call(this, serverUrl));

    _this.url.segment('effects');
    return _this;
  }

  /**
   * This endpoint represents all effects that changed a given account. It will return relevant effects from the creation of the account to the current ledger.
   * @see [Effects for Account](https://www.stellar.org/developers/horizon/reference/effects-for-account.html)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {EffectCallBuilder} this EffectCallBuilder instance
   */


  _createClass(EffectCallBuilder, [{
    key: 'forAccount',
    value: function forAccount(accountId) {
      this.filter.push(['accounts', accountId, 'effects']);
      return this;
    }

    /**
     * Effects are the specific ways that the ledger was changed by any operation.
     *
     * This endpoint represents all effects that occurred in the given ledger.
     * @see [Effects for Ledger](https://www.stellar.org/developers/horizon/reference/effects-for-ledger.html)
     * @param {number|string} sequence Ledger sequence
     * @returns {EffectCallBuilder} this EffectCallBuilder instance
     */

  }, {
    key: 'forLedger',
    value: function forLedger(sequence) {
      this.filter.push(['ledgers', typeof sequence === 'number' ? sequence.toString() : sequence, 'effects']);
      return this;
    }

    /**
     * This endpoint represents all effects that occurred as a result of a given transaction.
     * @see [Effects for Transaction](https://www.stellar.org/developers/horizon/reference/effects-for-transaction.html)
     * @param {string} transactionId Transaction ID
     * @returns {EffectCallBuilder} this EffectCallBuilder instance
     */

  }, {
    key: 'forTransaction',
    value: function forTransaction(transactionId) {
      this.filter.push(['transactions', transactionId, 'effects']);
      return this;
    }

    /**
     * This endpoint represents all effects that occurred as a result of a given operation.
     * @see [Effects for Operation](https://www.stellar.org/developers/horizon/reference/effects-for-operation.html)
     * @param {number} operationId Operation ID
     * @returns {EffectCallBuilder} this EffectCallBuilder instance
     */

  }, {
    key: 'forOperation',
    value: function forOperation(operationId) {
      this.filter.push(['operations', operationId, 'effects']);
      return this;
    }
  }]);

  return EffectCallBuilder;
}(_call_builder.CallBuilder);