/**
 * Global config parameters.
 */
export interface Configuration {
  /**
   * Allow connecting to http servers. This must be set to false in production deployments!
   * @default false
   */
  allowHttp: boolean;
  /**
   * Allow a timeout. Allows user to avoid nasty lag due network issues.
   * @default 0
   */
  timeout: number;
}

const defaultConfig: Configuration = {
  allowHttp: false,
  timeout: 0,
};

let config = { ...defaultConfig };

/**
 * Global config class.
 *
 * @hideconstructor
 *
 * @example <caption>Usage in node</caption>
 * import { Config } from '@stellar/stellar-sdk';
 * Config.setAllowHttp(true);
 * Config.setTimeout(5000);
 *
 * @example <caption>Usage in the browser</caption>
 * StellarSdk.Config.setAllowHttp(true);
 * StellarSdk.Config.setTimeout(5000);
 */
class Config {
  /**
   * Sets `allowHttp` flag globally. When set to `true`, connections to insecure
   * http protocol servers will be allowed. Must be set to `false` in
   * production.
   * @default false
   * @static
   */
  public static setAllowHttp(value: boolean): void {
    config.allowHttp = value;
  }

  /**
   * Sets `timeout` flag globally. When set to anything besides 0, the request
   * will timeout after specified time (ms).
   * @default 0
   * @static
   */
  public static setTimeout(value: number): void {
    config.timeout = value;
  }

  /**
   * Returns the configured `allowHttp` flag.
   * @static
   * @returns {boolean}
   */
  public static isAllowHttp(): boolean {
    return config.allowHttp;
  }

  /**
   * Returns the configured `timeout` flag.
   * @static
   * @returns {number}
   */
  public static getTimeout(): number {
    return config.timeout;
  }

  /**
   * Sets all global config flags to default values.
   * @static
   */
  public static setDefault(): void {
    config = { ...defaultConfig };
  }
}

export { Config };
