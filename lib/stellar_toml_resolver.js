'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StellarTomlResolver = exports.STELLAR_TOML_MAX_SIZE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _toml = require('toml');

var _toml2 = _interopRequireDefault(_toml);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// STELLAR_TOML_MAX_SIZE is the maximum size of stellar.toml file
var STELLAR_TOML_MAX_SIZE = exports.STELLAR_TOML_MAX_SIZE = 100 * 1024;

/**
 * StellarTomlResolver allows resolving `stellar.toml` files.
 */

var StellarTomlResolver = exports.StellarTomlResolver = function () {
  function StellarTomlResolver() {
    _classCallCheck(this, StellarTomlResolver);
  }

  _createClass(StellarTomlResolver, null, [{
    key: 'resolve',

    /**
     * Returns a parsed `stellar.toml` file for a given domain.
     * ```js
     * StellarSdk.StellarTomlResolver.resolve('acme.com')
     *   .then(stellarToml => {
     *     // stellarToml in an object representing domain stellar.toml file.
     *   })
     *   .catch(error => {
     *     // stellar.toml does not exist or is invalid
     *   });
     * ```
     * @see <a href="https://www.stellar.org/developers/learn/concepts/stellar-toml.html" target="_blank">Stellar.toml doc</a>
     * @param {string} domain Domain to get stellar.toml file for
     * @param {object} [opts] Options object
     * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
     * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
     * @returns {Promise} A `Promise` that resolves to the parsed stellar.toml object
     */
    value: function resolve(domain) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var allowHttp = _config.Config.isAllowHttp();
      var timeout = _config.Config.getTimeout();

      if (typeof opts.allowHttp !== 'undefined') {
        allowHttp = opts.allowHttp;
      }

      if (typeof opts.timeout === 'number') {
        timeout = opts.timeout;
      }

      var protocol = 'https';
      if (allowHttp) {
        protocol = 'http';
      }

      return _axios2.default.get(protocol + '://' + domain + '/.well-known/stellar.toml', {
        maxContentLength: STELLAR_TOML_MAX_SIZE,
        timeout: timeout
      }).then(function (response) {
        try {
          var tomlObject = _toml2.default.parse(response.data);
          return Promise.resolve(tomlObject);
        } catch (e) {
          return Promise.reject(new Error('Parsing error on line ' + e.line + ', column ' + e.column + ': ' + e.message));
        }
      }).catch(function (err) {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error('stellar.toml file exceeds allowed size of ' + STELLAR_TOML_MAX_SIZE);
        } else {
          throw err;
        }
      });
    }
  }]);

  return StellarTomlResolver;
}();