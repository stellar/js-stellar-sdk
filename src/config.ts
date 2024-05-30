interface Configuration {
  /**
   * Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @type {boolean}
   */
  allowHttp: boolean;
  /**
   * Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue. You can also use {@link Config} class to set this globally.
   * @type {number}
   */
  timeout: number;
}

const defaultConfig: Configuration = {
  allowHttp: false,
  timeout: 0,
};

let config = { ...defaultConfig};

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
class Config {
  /**
   * Sets `allowHttp` flag globally. When set to `true`, connections to insecure http protocol servers will be allowed.
   * Must be set to `false` in production. Default: `false`.
   * @param {boolean} value new allowHttp value
   * @returns {void}
   * @static
   */
  public static setAllowHttp(value: boolean): void {
    config.allowHttp = value;
  }

  /**
   * Sets `timeout` flag globally. When set to anything besides 0, the request will timeout after specified time (ms).
   * Default: 0.
   * @param {number} value new timeout value
   * @returns {void}
   * @static
   */
  public static setTimeout(value: number): void {
    config.timeout = value;
  }

  /**
   * @static
   * @returns {boolean} allowHttp flag
   */
  public static isAllowHttp(): boolean {
    return config.allowHttp;
  }

  /**
   * @static
   * @returns {number} timeout flag
   */
  public static getTimeout(): number {
    return config.timeout;
  }

  /**
   * Sets all global config flags to default values.
   * @static
   * @returns {void}
   */
  public static setDefault(): void {
    config = { ...defaultConfig};
  }
}

export { Config };
