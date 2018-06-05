import clone from 'lodash/clone';

let defaultConfig = {
  allowHttp: false,
  timeout: 0
};

let config = clone(defaultConfig);

/**
 * Global config class.
 *
 * Usage node:
 * ```
 * import {Config} from 'stellar-sdk';
 * Config.setAllowHttp(true);
 * Config.setTimout(5000);
 * ```
 *
 * Usage browser:
 * ```
 * StellarSdk.Config.setAllowHttp(true);
 * StellarSdk.Config.setTimout(5000);
 * ```
 * @static
 */
class Config {
  /**
   * Sets `allowHttp` flag globally. When set to `true`, connections to insecure http protocol servers will be allowed.
   * Must be set to `false` in production. Default: `false`.
   * @param {boolean} value
   * @static
   */
  static setAllowHttp(value) {
    config.allowHttp = value;
  }

  /**
   * Sets `timeout` flag globally. When set to anything besides 0, the request will timeout after specified time (ms).
   * Default: 0.
   * @param {number} value
   * @static
   */
  static setTimeout(value) {
    config.timeout = value;
  }

  /**
   * Returns the value of `allowHttp` flag.
   * @static
   */
  static isAllowHttp() {
    return clone(config.allowHttp);
  }

   /**
   * Returns the value of `timeout` flag.
   * @static
   */
  static getTimeout() {
    return clone(config.timeout);
  }

  /**
   * Sets all global config flags to default values.
   * @static
   */
  static setDefault() {
    config = clone(defaultConfig);
  }
}

export {Config};
