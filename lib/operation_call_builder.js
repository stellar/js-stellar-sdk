'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OperationCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link OperationCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#operations}.
 *
 * @see [All Operations](https://www.stellar.org/developers/horizon/reference/operations-all.html)
 * @class OperationCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
var OperationCallBuilder = exports.OperationCallBuilder = function (_CallBuilder) {
  _inherits(OperationCallBuilder, _CallBuilder);

  function OperationCallBuilder(serverUrl) {
    _classCallCheck(this, OperationCallBuilder);

    var _this = _possibleConstructorReturn(this, (OperationCallBuilder.__proto__ || Object.getPrototypeOf(OperationCallBuilder)).call(this, serverUrl));

    _this.url.segment('operations');
    return _this;
  }

  /**
   * The operation details endpoint provides information on a single operation. The operation ID provided in the id
   * argument specifies which operation to load.
   * @see [Operation Details](https://www.stellar.org/developers/horizon/reference/operations-single.html)
   * @param {number} operationId Operation ID
   * @returns {OperationCallBuilder} this OperationCallBuilder instance
   */


  _createClass(OperationCallBuilder, [{
    key: 'operation',
    value: function operation(operationId) {
      this.filter.push(['operations', operationId]);
      return this;
    }

    /**
     * This endpoint represents all operations that were included in valid transactions that affected a particular account.
     * @see [Operations for Account](https://www.stellar.org/developers/horizon/reference/operations-for-account.html)
     * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {OperationCallBuilder} this OperationCallBuilder instance
     */

  }, {
    key: 'forAccount',
    value: function forAccount(accountId) {
      this.filter.push(['accounts', accountId, 'operations']);
      return this;
    }

    /**
     * This endpoint returns all operations that occurred in a given ledger.
     *
     * @see [Operations for Ledger](https://www.stellar.org/developers/horizon/reference/operations-for-ledger.html)
     * @param {number|string} sequence Ledger sequence
     * @returns {OperationCallBuilder} this OperationCallBuilder instance
     */

  }, {
    key: 'forLedger',
    value: function forLedger(sequence) {
      this.filter.push(['ledgers', typeof sequence === 'number' ? sequence.toString() : sequence, 'operations']);
      return this;
    }

    /**
     * This endpoint represents all operations that are part of a given transaction.
     * @see [Operations for Transaction](https://www.stellar.org/developers/horizon/reference/operations-for-transaction.html)
     * @param {string} transactionId Transaction ID
     * @returns {OperationCallBuilder} this OperationCallBuilder instance
     */

  }, {
    key: 'forTransaction',
    value: function forTransaction(transactionId) {
      this.filter.push(['transactions', transactionId, 'operations']);
      return this;
    }
  }]);

  return OperationCallBuilder;
}(_call_builder.CallBuilder);