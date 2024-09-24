import axios from "axios";
import toml from "toml";
import { Networks } from "@stellar/stellar-base";

import { Config } from "../config";

/** the maximum size of stellar.toml file */
export const STELLAR_TOML_MAX_SIZE = 100 * 1024;

// axios timeout doesn't catch missing urls, e.g. those with no response
// so we use the axios cancel token to ensure the timeout
const CancelToken = axios.CancelToken;

/** Resolver allows resolving `stellar.toml` files. */
export class Resolver {
  /**
   * Returns a parsed `stellar.toml` file for a given domain.
   * ```js
   * StellarSdk.Resolver.resolve('acme.com')
   *   .then(stellarToml => {
   *     // stellarToml in an object representing domain stellar.toml file.
   *   })
   *   .catch(error => {
   *     // stellar.toml does not exist or is invalid
   *   });
   * ```
   * @see <a href="https://developers.stellar.org/docs/issuing-assets/publishing-asset-info/" target="_blank">Stellar.toml doc</a>
   * @param {string} domain Domain to get stellar.toml file for
   * @param {object} [opts] Options object
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise} A `Promise` that resolves to the parsed stellar.toml object
   */
  // eslint-disable-next-line require-await
  public static async resolve(
    domain: string,
    opts: Api.StellarTomlResolveOptions = {},
  ): Promise<Api.StellarToml> {
    const allowHttp =
      typeof opts.allowHttp === "undefined"
        ? Config.isAllowHttp()
        : opts.allowHttp;

    const timeout =
      typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout;

    const protocol = allowHttp ? "http" : "https";

    return axios
      .get(`${protocol}://${domain}/.well-known/stellar.toml`, {
        maxRedirects: opts.allowedRedirects ?? 0,
        maxContentLength: STELLAR_TOML_MAX_SIZE,
        cancelToken: timeout
          ? new CancelToken((cancel) =>
            setTimeout(
              () => cancel(`timeout of ${timeout}ms exceeded`),
              timeout,
            ),
          )
          : undefined,
        timeout,
      })
      .then((response) => {
        try {
          const tomlObject = toml.parse(response.data);
          return Promise.resolve(tomlObject);
        } catch (e: any) {
          return Promise.reject(
            new Error(
              `stellar.toml is invalid - Parsing error on line ${e.line}, column ${e.column}: ${e.message}`,
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

/* tslint:disable-next-line: no-namespace */
export namespace Api {
  export interface StellarTomlResolveOptions {
    allowHttp?: boolean;
    timeout?: number;
    allowedRedirects?: number;
  }
  export type Url = string;
  export type PublicKey = string;
  export type ISODateTime = string;
  export interface Documentation {
    ORG_NAME?: string;
    ORG_DBA?: string;
    ORG_URL?: Url;
    ORG_PHONE_NUMBER?: string;
    ORG_LOGO?: Url;
    ORG_LICENSE_NUMBER?: string;
    ORG_LICENSING_AUTHORITY?: string;
    ORG_LICENSE_TYPE?: string;
    ORG_DESCRIPTION?: string;
    ORG_PHYSICAL_ADDRESS?: string;
    ORG_PHYSICAL_ADDRESS_ATTESTATION?: string;
    ORG_PHONE_NUMBER_ATTESTATION?: string;
    ORG_OFFICIAL_EMAIL?: string;
    ORG_SUPPORT_EMAIL?: string;
    ORG_KEYBASE?: string;
    ORG_TWITTER?: string;
    ORG_GITHUB?: string;
    [key: string]: unknown;
  }
  export interface Principal {
    name: string;
    email: string;
    github?: string;
    keybase?: string;
    telegram?: string;
    twitter?: string;
    id_photo_hash?: string;
    verification_photo_hash?: string;
    [key: string]: unknown;
  }
  export interface Currency {
    code?: string;
    code_template?: string;
    issuer?: PublicKey;
    display_decimals?: number;
    status?: "live" | "dead" | "test" | "private";
    name?: string;
    desc?: string;
    conditions?: string;
    fixed_number?: number;
    max_number?: number;
    is_asset_anchored?: boolean;
    anchor_asset_type?:
      | "fiat"
      | "crypto"
      | "nft"
      | "stock"
      | "bond"
      | "commodity"
      | "realestate"
      | "other";
    anchor_asset?: string;
    attestation_of_reserve?: Url;
    attestation_of_reserve_amount?: string;
    attestation_of_reserve_last_audit?: ISODateTime;
    is_unlimited?: boolean;
    redemption_instructions?: string;
    image?: Url;
    regulated?: boolean;
    collateral_addresses?: string[];
    collateral_address_messages?: string[];
    collateral_address_signatures?: string[];
    approval_server?: Url;
    approval_criteria?: string;
    [key: string]: unknown;
  }

  export interface Validator {
    ALIAS?: string;
    DISPLAY_NAME?: string;
    PUBLIC_KEY?: PublicKey;
    HOST?: string;
    HISTORY?: Url;
    [key: string]: unknown;
  }
  // All fields are optional because there are no runtime checks
  // on external data body
  // Sourced from https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
  export interface StellarToml {
    VERSION?: string;
    ACCOUNTS?: PublicKey[];
    NETWORK_PASSPHRASE?: Networks;
    TRANSFER_SERVER_SEP0024?: Url;
    TRANSFER_SERVER?: Url;
    KYC_SERVER?: Url;
    WEB_AUTH_ENDPOINT?: Url;
    FEDERATION_SERVER?: Url;
    SIGNING_KEY?: PublicKey;
    HORIZON_URL?: Url;
    URI_REQUEST_SIGNING_KEY?: PublicKey;
    DIRECT_PAYMENT_SERVER?: Url;
    ANCHOR_QUOTE_SERVER?: Url;
    DOCUMENTATION?: Documentation;
    PRINCIPALS?: Principal[];
    CURRENCIES?: Currency[];
    VALIDATORS?: Validator[];
    [key: string]: unknown;
  }
}
