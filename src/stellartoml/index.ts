import { parse } from "smol-toml";
import { Networks } from "../base/index.js";
import { httpClient } from "../http-client/index.js";

import { Config } from "../config.js";

/**
 * The maximum size of stellar.toml file, in bytes
 * @defaultValue 102400
 */
export const STELLAR_TOML_MAX_SIZE = 100 * 1024;

const STELLAR_TOML_PATH = "/.well-known/stellar.toml";

// These characters end the authority section of a URL, so the parser reads what
// follows as a host, a path, or credentials. Whitespace is here because it does
// not parse the same way everywhere: the parser deletes a tab from the host, and
// Chromium encodes a space into it.
const INVALID_DOMAIN_CHARS = /[\s@/?#\\]/;

// A trailing separator, and surrounding whitespace, reached the right host
// before this check existed, so strip them rather than reject them. Only the
// trailing ones: a leading `/` names a different host.
const TRAILING_SEPARATORS = /[/\\]+$/;

/**
 * Resolver allows resolving `stellar.toml` files.
 */
export class Resolver {
  /**
   * Returns a parsed `stellar.toml` file for a given domain.
   * @see {@link https://developers.stellar.org/docs/tokens/publishing-asset-info | Stellar.toml doc}
   *
   * @param domain - Domain to get stellar.toml file for. Must be a host name with an optional port; surrounding whitespace and a trailing `/` are ignored.
   * @param opts - (optional) Options object
   *   - `allowHttp` (optional): Allow connecting to http servers. This must be set to false in production deployments!
   *   - `timeout` (optional): Allow a timeout. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns A `Promise` that resolves to the parsed stellar.toml object
   * @throws `Error` if `domain` is not a plain host name, before any request is made
   *
   * @example
   * ```ts
   * StellarSdk.StellarToml.Resolver.resolve('acme.com')
   *   .then(stellarToml => {
   *     // stellarToml in an object representing domain stellar.toml file.
   *   })
   *   .catch(error => {
   *     // domain is invalid, or stellar.toml does not exist or is invalid
   *   });
   * ```
   */
  public static async resolve(
    domain: string,
    opts: Api.StellarTomlResolveOptions = {},
  ): Promise<Api.StellarToml> {
    const { CancelToken } = httpClient;

    const allowHttp =
      typeof opts.allowHttp === "undefined"
        ? Config.isAllowHttp()
        : opts.allowHttp;

    const timeout =
      typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout;

    const protocol = allowHttp ? "http" : "https";

    const name = String(domain).trim().replace(TRAILING_SEPARATORS, "");

    // The character test alone misses an empty domain, which promotes
    // `.well-known` to the host. The parse test alone misses a leading
    // delimiter, because `//evil.com` and `@evil.com` build a clean URL.
    let url: URL | undefined;
    try {
      url = new URL(`${protocol}://${name}${STELLAR_TOML_PATH}`);
    } catch {
      // Reported below, with the same error as a domain that parses wrong.
    }
    // A real host is ASCII or punycode, so a percent-encoding in it means the
    // parser kept a character that does not belong. Chromium reaches here for
    // `*` and for spacing diacritics; Node and Firefox refuse the URL instead.
    if (
      !url ||
      INVALID_DOMAIN_CHARS.test(name) ||
      url.host.includes("%") ||
      url.href !== `${protocol}://${url.host}${STELLAR_TOML_PATH}`
    ) {
      throw new Error(
        `Invalid domain: ${JSON.stringify(domain)}. A domain must be a host name with an optional port.`,
      );
    }

    return httpClient
      .get(url.href, {
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
          const tomlObject = parse(response.data);
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
  export type ContractId = string;
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
    WEB_AUTH_FOR_CONTRACTS_ENDPOINT?: Url;
    WEB_AUTH_CONTRACT_ID?: ContractId;
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
