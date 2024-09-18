/**
 * @namespace Api
 * @memberof module:Friendbot
 */

/**
 * @typedef {object} Response
 * @memberof module:Friendbot.Api
 * @property {string} result_meta_xdr The base64-encoded XDR result meta of the transaction that Friendbot submitted to create the account.
 */

export namespace Api {
  // Just the fields we are interested in
  export interface Response {
    result_meta_xdr: string;
  }
}
