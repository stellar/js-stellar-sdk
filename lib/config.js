'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultConfig = {
  allowHttp: false,
  timeout: 0
};

var config = (0, _clone2.default)(defaultConfig);

/**
 * Global config class.
 *
 * Usage node:
 * ```
 * import {Config} from 'stellar-sdk';
 * Config.setAllowHttp(true);
 * Config.setTimeout(5000);
 * ```
 *
 * Usage browser:
 * ```
 * StellarSdk.Config.setAllowHttp(true);
 * StellarSdk.Config.setTimeout(5000);
 * ```
 * @static
 */

var Config = function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, null, [{
    key: 'setAllowHttp',

    /**
     * Sets `allowHttp` flag globally. When set to `true`, connections to insecure http protocol servers will be allowed.
     * Must be set to `false` in production. Default: `false`.
     * @param {boolean} value new allowHttp value
     * @returns {void}
     * @static
     */
    value: function setAllowHttp(value) {
      config.allowHttp = value;
    }

    /**
     * Sets `timeout` flag globally. When set to anything besides 0, the request will timeout after specified time (ms).
     * Default: 0.
     * @param {number} value new timeout value
     * @returns {void}
     * @static
     */

  }, {
    key: 'setTimeout',
    value: function setTimeout(value) {
      config.timeout = value;
    }

    /**
     * @static
     * @returns {boolean} allowHttp flag
     */

  }, {
    key: 'isAllowHttp',
    value: function isAllowHttp() {
      return (0, _clone2.default)(config.allowHttp);
    }

    /**
     * @static
     * @returns {number} timeout flag
     */

  }, {
    key: 'getTimeout',
    value: function getTimeout() {
      return (0, _clone2.default)(config.timeout);
    }

    /**
     * Sets all global config flags to default values.
     * @static
     * @returns {void}
     */

  }, {
    key: 'setDefault',
    value: function setDefault() {
      config = (0, _clone2.default)(defaultConfig);
    }
  }]);

  return Config;
}();

exports.Config = Config;