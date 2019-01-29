'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccountCallBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link AccountCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#accounts}.
 *
 * @see [All Accounts](https://www.stellar.org/developers/horizon/reference/accounts-all.html)
 * @class AccountCallBuilder
 * @extends CallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 */
var AccountCallBuilder = exports.AccountCallBuilder = function (_CallBuilder) {
  _inherits(AccountCallBuilder, _CallBuilder);

  function AccountCallBuilder(serverUrl) {
    _classCallCheck(this, AccountCallBuilder);

    var _this = _possibleConstructorReturn(this, (AccountCallBuilder.__proto__ || Object.getPrototypeOf(AccountCallBuilder)).call(this, serverUrl));

    _this.url.segment('accounts');
    return _this;
  }

  /**
   * Returns information and links relating to a single account.
   * The balances section in the returned JSON will also list all the trust lines this account has set up.
   *
   * @see [Account Details](https://www.stellar.org/developers/horizon/reference/accounts-single.html)
   * @param {string} id For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {AccountCallBuilder} current AccountCallBuilder instance
   */


  _createClass(AccountCallBuilder, [{
    key: 'accountId',
    value: function accountId(id) {
      this.filter.push(['accounts', id]);
      return this;
    }
  }]);

  return AccountCallBuilder;
}(_call_builder.CallBuilder);