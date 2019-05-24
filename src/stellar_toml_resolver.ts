import axios from "axios";
import toml from "toml";
import { Config } from "./config";

// STELLAR_TOML_MAX_SIZE is the maximum size of stellar.toml file
export const STELLAR_TOML_MAX_SIZE = 100 * 1024;

/**
 * StellarTomlResolver allows resolving `stellar.toml` files.
 */
export class StellarTomlResolver {
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
   * @see <a href="https://www.stellar.org/developers/guides/concepts/stellar-toml.html" target="_blank">Stellar.toml doc</a>
   * @param {string} domain Domain to get stellar.toml file for
   * @param {object} [opts] Options object
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise} A `Promise` that resolves to the parsed stellar.toml object
   */
  public static async resolve(
    domain: string,
    opts: StellarTomlResolver.StellarTomlResolveOptions = {},
  ): Promise<{ [key: string]: any }> {
    const allowHttp =
      typeof opts.allowHttp === "undefined"
        ? Config.isAllowHttp()
        : opts.allowHttp;

    const timeout =
      typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout;

    const protocol = allowHttp ? "http" : "https";

    return axios
      .get(`${protocol}://${domain}/.well-known/stellar.toml`, {
        maxContentLength: STELLAR_TOML_MAX_SIZE,
        timeout,
      })
      .then((response) => {
        try {
          const tomlObject = toml.parse(response.data);
          return Promise.resolve(tomlObject);
        } catch (e) {
          return Promise.reject(
            new Error(
              `Parsing error on line ${e.line}, column ${e.column}: ${
                e.message
              }`,
            ),
          );
        }
      })
      .catch((err: Error) => {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error(
            `stellar.toml file exceeds allowed size of ${STELLAR_TOML_MAX_SIZE}`,
          );
        } else {
          throw err;
        }
      });
  }
}

export namespace StellarTomlResolver {
  export interface StellarTomlResolveOptions {
    allowHttp?: boolean;
    timeout?: number;
  }
}
