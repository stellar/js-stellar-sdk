'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaymentCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PaymentCallBuilder = exports.PaymentCallBuilder = function (_CallBuilder) {
  _inherits(PaymentCallBuilder, _CallBuilder);

  /**
   * Creates a new {@link PaymentCallBuilder} pointed to server defined by serverUrl.
   *
   * Do not create this object directly, use {@link Server#payments}.
   * @see [All Payments](https://www.stellar.org/developers/horizon/reference/payments-all.html)
   * @constructor
   * @extends CallBuilder
   * @param {string} serverUrl Horizon server URL.
   */
  function PaymentCallBuilder(serverUrl) {
    _classCallCheck(this, PaymentCallBuilder);

    var _this = _possibleConstructorReturn(this, (PaymentCallBuilder.__proto__ || Object.getPrototypeOf(PaymentCallBuilder)).call(this, serverUrl));

    _this.url.segment('payments');
    return _this;
  }

  /**
   * This endpoint responds with a collection of Payment operations where the given account was either the sender or receiver.
   * @see [Payments for Account](https://www.stellar.org/developers/horizon/reference/payments-for-account.html)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */


  _createClass(PaymentCallBuilder, [{
    key: 'forAccount',
    value: function forAccount(accountId) {
      this.filter.push(['accounts', accountId, 'payments']);
      return this;
    }

    /**
     * This endpoint represents all payment operations that are part of a valid transactions in a given ledger.
     * @see [Payments for Ledger](https://www.stellar.org/developers/horizon/reference/payments-for-ledger.html)
     * @param {number|string} sequence Ledger sequence
     * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
     */

  }, {
    key: 'forLedger',
    value: function forLedger(sequence) {
      this.filter.push(['ledgers', typeof sequence === 'number' ? sequence.toString() : sequence, 'payments']);
      return this;
    }

    /**
     * This endpoint represents all payment operations that are part of a given transaction.
     * @see [Payments for Transaction](https://www.stellar.org/developers/horizon/reference/payments-for-transaction.html)
     * @param {string} transactionId Transaction ID
     * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
     */

  }, {
    key: 'forTransaction',
    value: function forTransaction(transactionId) {
      this.filter.push(['transactions', transactionId, 'payments']);
      return this;
    }
  }]);

  return PaymentCallBuilder;
}(_call_builder.CallBuilder);