import { HorizonApi } from "../horizon/horizon_api";

// For ES5 compatibility (https://stackoverflow.com/a/55066280).

/**
 * NetworkError is raised when an interaction with a Horizon server has caused
 * some kind of problem.
 */
export class NetworkError extends Error {
  public response: {
    data?: HorizonApi.ErrorResponseData;
    status?: number;
    statusText?: string;
    url?: string;
  };
  public __proto__: NetworkError;

  /**
   * Create a NetworkError.
   * @param {string} message Human-readable error message
   * @param {any} response Response details, received from the Horizon server
   */
  constructor(message: string, response: any) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
    this.constructor = NetworkError;
    /**
     * @typedef {Object}
     * @property {HorizonApi.ErrorResponseData} [data] The data returned by Horizon as part of the error: {@link https://developers.stellar.org/network/horizon/api-reference/errors/response | Error Response}
     * @property {number} [status] HTTP status code describing the basic issue with a submitted transaction {@link https://developers.stellar.org/network/horizon/api-reference/errors/http-status-codes/standard | Standard Status Codes}
     * @property {string} [statusText] A human-readable description of what the status code means: {@link https://developers.stellar.org/network/horizon/api-reference/errors/http-status-codes/horizon-specific | Horizon-Specific Status Codes}
     * @property {string} [url] URL which can provide more information about the problem that occurred.
     */
    this.response = response;
  }

  /**
   * Get the response object that created this error.
   * @returns {any}
   */
  public getResponse() {
    return this.response;
  }
}

