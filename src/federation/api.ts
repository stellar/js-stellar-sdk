import type { Config } from "../config.js";

export namespace Api {
  /**
   * Record returned from a federation server.
   */
  export interface Record {
    /**
     * The Stellar public key resolved from the federation lookup
     */
    account_id: string;
    /**
     * The type of memo, if any, required to send payments to this user
     */
    memo_type?: string;
    /**
     * The memo value, if any, required to send payments to this user
     */
    memo?: string;
  }

  /**
   * Options for configuring connections to federation servers. You can also use {@link Config} class to set this globally.
   */
  export interface Options {
    /**
     * Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
     */
    allowHttp?: boolean;
    /**
     * Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
     */
    timeout?: number;
    /**
     * The number of redirects to follow, as 0 or a whole number up to `Number.MAX_SAFE_INTEGER`, default: 0. Also applies to the `stellar.toml` request in `createForDomain` and `resolve`. Outside Node, the SDK relies on the runtime to refuse redirects. In a browser, the Fetch build cannot count redirects, so a value above 0 follows up to the browser's own limit. The Axios build in a browser, and both builds in React Native, follow redirects whatever this value is.
     */
    allowedRedirects?: number;
  }
}
