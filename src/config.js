import clone from 'lodash/clone';

let defaultConfig = {
  allowHttp: false
};

let config = clone(defaultConfig);

/**
 * Global config class.
 *
 * Usage node:
 * ```
 * import {Config} from 'stellar-sdk';
 * Config.setAllowHttp(true);
 * ```
 *
 * Usage browser:
 * ```
 * StellarSdk.Config.setAllowHttp(true);
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
   * Returns the value of `allowHttp` flag.
   * @static
   */
  static isAllowHttp() {
    return clone(config.allowHttp);
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
