/* tslint:disable-next-line:no-namespace */

/**
 * @namespace Api
 * @memberof module:Federation
 */

/**
 * @typedef {Object} Record Record returned from a federation server.
 * @memberof module:Federation.Api
 * @property {string} account_id The Stellar public key resolved from the federation lookup
 * @property {string} [memo_type] The type of memo, if any, required to send payments to this user
 * @property {string} [memo] The memo value, if any, required to send payments to this user
 */

/**
 * @typedef {Object} Options Options for configuring connections to federation servers.
 * @memberof module:Federation.Api
 * @property {boolean} [allowHttp=false] Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
 * @property {number} [timeout=0] Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue. You can also use {@link Config} class to set this globally.
 */

export namespace Api {
  export interface Record {
    account_id: string;
    memo_type?: string;
    memo?: string;
  }

  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
  }
}
