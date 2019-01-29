'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link TransactionCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#transactions}.
 *
 * @class TransactionCallBuilder
 * @extends CallBuilder
 * @see [All Transactions](https://www.stellar.org/developers/horizon/reference/transactions-all.html)
 * @constructor
 * @param {string} serverUrl Horizon server URL.
 */
var TransactionCallBuilder = exports.TransactionCallBuilder = function (_CallBuilder) {
  _inherits(TransactionCallBuilder, _CallBuilder);

  function TransactionCallBuilder(serverUrl) {
    _classCallCheck(this, TransactionCallBuilder);

    var _this = _possibleConstructorReturn(this, (TransactionCallBuilder.__proto__ || Object.getPrototypeOf(TransactionCallBuilder)).call(this, serverUrl));

    _this.url.segment('transactions');
    return _this;
  }

  /**
   * The transaction details endpoint provides information on a single transaction. The transaction hash provided in the hash argument specifies which transaction to load.
   * @see [Transaction Details](https://www.stellar.org/developers/horizon/reference/transactions-single.html)
   * @param {string} transactionId Transaction ID
   * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
   */


  _createClass(TransactionCallBuilder, [{
    key: 'transaction',
    value: function transaction(transactionId) {
      this.filter.push(['transactions', transactionId]);
      return this;
    }

    /**
     * This endpoint represents all transactions that affected a given account.
     * @see [Transactions for Account](https://www.stellar.org/developers/horizon/reference/transactions-for-account.html)
     * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
     */

  }, {
    key: 'forAccount',
    value: function forAccount(accountId) {
      this.filter.push(['accounts', accountId, 'transactions']);
      return this;
    }

    /**
     * This endpoint represents all transactions in a given ledger.
     * @see [Transactions for Ledger](https://www.stellar.org/developers/horizon/reference/transactions-for-ledger.html)
     * @param {number|string} sequence Ledger sequence
     * @returns {TransactionCallBuilder} current TransactionCallBuilder instance
     */

  }, {
    key: 'forLedger',
    value: function forLedger(sequence) {
      var ledgerSequence = typeof sequence === 'number' ? sequence.toString() : sequence;

      this.filter.push(['ledgers', ledgerSequence, 'transactions']);
      return this;
    }
  }]);

  return TransactionCallBuilder;
}(_call_builder.CallBuilder);