import { HorizonApi } from "../horizon/horizon_api.js";

// For ES5 compatibility (https://stackoverflow.com/a/55066280).

/**
 * NetworkError is raised when an interaction with a Horizon server has caused
 * some kind of problem.
 *
 * @param message - Human-readable error message
 * @param response - Response details, received from the Horizon server.
 *   - `data` (optional): The data returned by Horizon as part of the error: {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/response | Error Response}
 *   - `status` (optional): HTTP status code describing the basic issue with a submitted transaction {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/http-status-codes/standard | Standard Status Codes}
 *   - `statusText` (optional): A human-readable description of what the status code means: {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/http-status-codes/horizon-specific | Horizon-Specific Status Codes}
 *   - `url` (optional): URL which can provide more information about the problem that occurred.
 */
export class NetworkError extends Error {
  /** Response details, received from the Horizon server. */
  public response: {
    /** The data returned by Horizon as part of the error: {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/response | Error Response} */
    data?: HorizonApi.ErrorResponseData;
    /** HTTP status code describing the basic issue with a submitted transaction {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/http-status-codes/standard | Standard Status Codes} */
    status?: number;
    /** A human-readable description of what the status code means: {@link https://developers.stellar.org/docs/data/horizon/api-reference/errors/http-status-codes/horizon-specific | Horizon-Specific Status Codes} */
    statusText?: string;
    /** URL which can provide more information about the problem that occurred. */
    url?: string;
  };

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
  }

  /**
   * Returns the error response sent by the Horizon server.
   * @returns Response details, received from the Horizon server.
   */
  public getResponse() {
    return this.response;
  }
}
