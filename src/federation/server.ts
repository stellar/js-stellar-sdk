import axios from "axios";
import { StrKey } from "@stellar/stellar-base";
import URI from "urijs";

import { Config } from "../config";
import { BadResponseError } from "../errors";
import { Resolver } from "../stellartoml";

import { Api } from "./api";

// FEDERATION_RESPONSE_MAX_SIZE is the maximum size of response from a federation server
export const FEDERATION_RESPONSE_MAX_SIZE = 100 * 1024;

/**
 * FederationServer handles a network connection to a
 * [federation server](https://developers.stellar.org/docs/glossary/federation/)
 * instance and exposes an interface for requests to that instance.
 * @class
 * @param {string} serverURL The federation server URL (ex. `https://acme.com/federation`).
 * @param {string} domain Domain this server represents
 * @param {object} [opts] options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue. You can also use {@link Config} class to set this globally.
 * @returns {void}
 */
export class FederationServer {
  /**
   * The federation server URL (ex. `https://acme.com/federation`).
   *
   * @memberof FederationServer
   */
  private readonly serverURL: URI; // TODO: public or private? readonly?

  /**
   * Domain this server represents.
   *
   * @type {string}
   * @memberof FederationServer
   */
  private readonly domain: string; // TODO: public or private? readonly?

  /**
   * Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   *
   * @type {number}
   * @memberof FederationServer
   */
  private readonly timeout: number; // TODO: public or private? readonly?

  /**
   * A helper method for handling user inputs that contain `destination` value.
   * It accepts two types of values:
   *
   * * For Stellar address (ex. `bob*stellar.org`) it splits Stellar address and then tries to find information about
   * federation server in `stellar.toml` file for a given domain. It returns a `Promise` which resolves if federation
   * server exists and user has been found and rejects in all other cases.
   * * For Account ID (ex. `GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS`) it returns a `Promise` which
   * resolves if Account ID is valid and rejects in all other cases. Please note that this method does not check
   * if the account actually exists in a ledger.
   *
   * Example:
   * ```js
   * StellarSdk.FederationServer.resolve('bob*stellar.org')
   *  .then(federationRecord => {
   *    // {
   *    //   account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS',
   *    //   memo_type: 'id',
   *    //   memo: 100
   *    // }
   *  });
   * ```
   *
   * @see <a href="https://developers.stellar.org/docs/glossary/federation/" target="_blank">Federation doc</a>
   * @see <a href="https://developers.stellar.org/docs/issuing-assets/publishing-asset-info/" target="_blank">Stellar.toml doc</a>
   * @param {string} value Stellar Address (ex. `bob*stellar.org`)
   * @param {object} [opts] Options object
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise} `Promise` that resolves to a JSON object with this shape:
   * * `account_id` - Account ID of the destination,
   * * `memo_type` (optional) - Memo type that needs to be attached to a transaction,
   * * `memo` (optional) - Memo value that needs to be attached to a transaction.
   */
  public static async resolve(
    value: string,
    opts: Api.Options = {},
  ): Promise<Api.Record> {
    // Check if `value` is in account ID format
    if (value.indexOf("*") < 0) {
      if (!StrKey.isValidEd25519PublicKey(value)) {
        return Promise.reject(new Error("Invalid Account ID"));
      }
      return Promise.resolve({ account_id: value });
    }

    const addressParts = value.split("*");
    const [, domain] = addressParts;

    if (addressParts.length !== 2 || !domain) {
      return Promise.reject(new Error("Invalid Stellar address"));
    }
    const federationServer = await FederationServer.createForDomain(
      domain,
      opts,
    );
    return federationServer.resolveAddress(value);
  }

  /**
   * Creates a `FederationServer` instance based on information from
   * [stellar.toml](https://developers.stellar.org/docs/issuing-assets/publishing-asset-info/)
   * file for a given domain.
   *
   * If `stellar.toml` file does not exist for a given domain or it does not
   * contain information about a federation server Promise will reject.
   * ```js
   * StellarSdk.FederationServer.createForDomain('acme.com')
   *   .then(federationServer => {
   *     // federationServer.resolveAddress('bob').then(...)
   *   })
   *   .catch(error => {
   *     // stellar.toml does not exist or it does not contain information about federation server.
   *   });
   * ```
   * @see <a href="https://developers.stellar.org/docs/issuing-assets/publishing-asset-info/" target="_blank">Stellar.toml doc</a>
   * @param {string} domain Domain to get federation server for
   * @param {object} [opts] Options object
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise} `Promise` that resolves to a FederationServer object
   */
  public static async createForDomain(
    domain: string,
    opts: Api.Options = {},
  ): Promise<FederationServer> {
    const tomlObject = await Resolver.resolve(domain, opts);
    if (!tomlObject.FEDERATION_SERVER) {
      return Promise.reject(
        new Error("stellar.toml does not contain FEDERATION_SERVER field"),
      );
    }
    return new FederationServer(tomlObject.FEDERATION_SERVER, domain, opts);
  }

  public constructor(
    serverURL: string,
    domain: string,
    opts: Api.Options = {},
  ) {
    // TODO `domain` regexp
    this.serverURL = URI(serverURL);
    this.domain = domain;

    const allowHttp =
      typeof opts.allowHttp === "undefined"
        ? Config.isAllowHttp()
        : opts.allowHttp;

    this.timeout =
      typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout;

    if (this.serverURL.protocol() !== "https" && !allowHttp) {
      throw new Error("Cannot connect to insecure federation server");
    }
  }

  /**
   * Get the federation record if the user was found for a given Stellar address
   * @see <a href="https://developers.stellar.org/docs/glossary/federation/" target="_blank">Federation doc</a>
   * @param {string} address Stellar address (ex. `bob*stellar.org`). If `FederationServer` was instantiated with `domain` param only username (ex. `bob`) can be passed.
   * @returns {Promise} Promise that resolves to the federation record
   */
  public async resolveAddress(
    address: string,
  ): Promise<Api.Record> {
    let stellarAddress = address;
    if (address.indexOf("*") < 0) {
      if (!this.domain) {
        return Promise.reject(
          new Error(
            "Unknown domain. Make sure `address` contains a domain (ex. `bob*stellar.org`) or pass `domain` parameter when instantiating the server object.",
          ),
        );
      }
      stellarAddress = `${address}*${this.domain}`;
    }
    const url = this.serverURL.query({ type: "name", q: stellarAddress });
    return this._sendRequest(url);
  }

  /**
   * Given an account ID, get their federation record if the user was found
   * @see <a href="https://developers.stellar.org/docs/glossary/federation/" target="_blank">Federation doc</a>
   * @param {string} accountId Account ID (ex. `GBYNR2QJXLBCBTRN44MRORCMI4YO7FZPFBCNOKTOBCAAFC7KC3LNPRYS`)
   * @returns {Promise} A promise that resolves to the federation record
   */
  public async resolveAccountId(
    accountId: string,
  ): Promise<Api.Record> {
    const url = this.serverURL.query({ type: "id", q: accountId });
    return this._sendRequest(url);
  }

  /**
   * Given a transactionId, get the federation record if the sender of the transaction was found
   * @see <a href="https://developers.stellar.org/docs/glossary/federation/" target="_blank">Federation doc</a>
   * @param {string} transactionId Transaction ID (ex. `3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889`)
   * @returns {Promise} A promise that resolves to the federation record
   */
  public async resolveTransactionId(
    transactionId: string,
  ): Promise<Api.Record> {
    const url = this.serverURL.query({ type: "txid", q: transactionId });
    return this._sendRequest(url);
  }

  private async _sendRequest(url: URI) {
    const timeout = this.timeout;

    return axios
      .get(url.toString(), {
        maxContentLength: FEDERATION_RESPONSE_MAX_SIZE,
        timeout,
      })
      .then((response) => {
        if (
          typeof response.data.memo !== "undefined" &&
          typeof response.data.memo !== "string"
        ) {
          throw new Error("memo value should be of type string");
        }
        return response.data;
      })
      .catch((response) => {
        if (response instanceof Error) {
          if (response.message.match(/^maxContentLength size/)) {
            throw new Error(
              `federation response exceeds allowed size of ${FEDERATION_RESPONSE_MAX_SIZE}`,
            );
          } else {
            return Promise.reject(response);
          }
        } else {
          return Promise.reject(
            new BadResponseError(
              `Server query failed. Server responded: ${response.status} ${response.statusText}`,
              response.data,
            ),
          );
        }
      });
  }
}
