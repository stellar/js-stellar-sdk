'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccountResponse = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stellarBase = require('stellar-base');

var _forIn = require('lodash/forIn');

var _forIn2 = _interopRequireDefault(_forIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Do not create this object directly, use {@link Server#loadAccount}.
 *
 * Returns information and links relating to a single account.
 * The balances section in the returned JSON will also list all the trust lines this account has set up.
 * It also contains {@link Account} object and exposes it's methods so can be used in {@link TransactionBuilder}.
 *
 * @see [Account Details](https://www.stellar.org/developers/horizon/reference/accounts-single.html)
 * @param {string} response Response from horizon account endpoint.
 * @returns {AccountResponse} AccountResponse instance
 */
var AccountResponse = exports.AccountResponse = function () {
  function AccountResponse(response) {
    var _this = this;

    _classCallCheck(this, AccountResponse);

    this._baseAccount = new _stellarBase.Account(response.account_id, response.sequence);
    // Extract response fields
    (0, _forIn2.default)(response, function (value, key) {
      _this[key] = value;
    });
  }

  /**
   * Get Stellar account public key ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
   * @returns {string} accountId
   */


  _createClass(AccountResponse, [{
    key: 'accountId',
    value: function accountId() {
      return this._baseAccount.accountId();
    }

    /**
     * Get the current sequence number
     * @returns {string} sequenceNumber
     */

  }, {
    key: 'sequenceNumber',
    value: function sequenceNumber() {
      return this._baseAccount.sequenceNumber();
    }

    /**
     * Increments sequence number in this object by one.
     * @returns {void}
     */

  }, {
    key: 'incrementSequenceNumber',
    value: function incrementSequenceNumber() {
      this._baseAccount.incrementSequenceNumber();
      this.sequence = this._baseAccount.sequenceNumber();
    }
  }]);

  return AccountResponse;
}();