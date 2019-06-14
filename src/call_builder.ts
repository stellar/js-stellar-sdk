import isNode from "detect-node";
import URI from "urijs";
import URITemplate from "urijs/src/URITemplate";

import { version } from "../package.json";
import { BadRequestError, NetworkError, NotFoundError } from "./errors";
import { Horizon } from "./horizon_api";
import HorizonAxiosClient from "./horizon_axios_client";
import { ServerApi } from "./server_api";

type Constructable<T> = new (e: string) => T;
declare global {
  interface Window {
    EventSource: Constructable<EventSource>;
  }
}

export interface EventSourceOptions {
  onmessage?: (event: MessageEvent) => void;
  onerror?: (event: MessageEvent) => void;
  reconnectTimeout?: number;
}

let EventSource: Constructable<EventSource>;

if (isNode) {
  /* tslint:disable-next-line:no-var-requires */
  EventSource = require("eventsource");
} else {
  /* tslint:disable-next-line:variable-name */
  EventSource = window.EventSource;
}

/**
 * Creates a new {@link CallBuilder} pointed to server defined by serverUrl.
 *
 * This is an **abstract** class. Do not create this object directly, use {@link Server} class.
 * @param {string} serverUrl URL of Horizon server
 * @class CallBuilder
 */
export class CallBuilder<
  T extends
    | Horizon.BaseResponse
    | ServerApi.CollectionPage<Horizon.BaseResponse>
> {
  protected url: uri.URI;
  public filter: string[][];
  protected originalSegments: string[];

  constructor(serverUrl: uri.URI) {
    this.url = serverUrl;
    this.filter = [];
    this.originalSegments = this.url.segment() || [];
  }

  /**
   * Triggers a HTTP request using this builder's current configuration.
   * @returns {Promise} a Promise that resolves to the server's response.
   */
  public call(): Promise<T> {
    this.checkFilter();
    return this._sendNormalRequest(this.url).then((r) =>
      this._parseResponse(r),
    );
  }
  //// TODO: Migrate to async, BUT that's a change in behavior and tests "rejects two filters" will fail.
  //// It's because async will check within promise, which makes more sense when using awaits instead of Promises.
  // public async call(): Promise<T> {
  //   this.checkFilter();
  //   const r = await this._sendNormalRequest(this.url);
  //   return this._parseResponse(r);
  // }
  //// /* actually equals */
  //// public call(): Promise<T> {
  ////   return Promise.resolve().then(() => {
  ////     this.checkFilter();
  ////     return this._sendNormalRequest(this.url)
  ////   }).then((r) => {
  ////     this._parseResponse(r)
  ////   });
  //// }

  /**
   * Creates an EventSource that listens for incoming messages from the server. To stop listening for new
   * events call the function returned by this method.
   * @see [Horizon Response Format](https://www.stellar.org/developers/horizon/reference/responses.html)
   * @see [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
   * @param {object} [options] EventSource options.
   * @param {function} [options.onmessage] Callback function to handle incoming messages.
   * @param {function} [options.onerror] Callback function to handle errors.
   * @param {number} [options.reconnectTimeout] Custom stream connection timeout in ms, default is 15 seconds.
   * @returns {function} Close function. Run to close the connection and stop listening for new events.
   */
  public stream(options: EventSourceOptions = {}): () => void {
    this.checkFilter();

    this.url.setQuery("X-Client-Name", "js-stellar-sdk");
    this.url.setQuery("X-Client-Version", version);

    // EventSource object
    let es: EventSource;
    // timeout is the id of the timeout to be triggered if there were no new messages
    // in the last 15 seconds. The timeout is reset when a new message arrive.
    // It prevents closing EventSource object in case of 504 errors as `readyState`
    // property is not reliable.
    let timeout: NodeJS.Timeout;

    const createTimeout = () => {
      timeout = setTimeout(() => {
        es.close();
        /* tslint:disable-next-line:no-use-before-declare */
        es = createEventSource();
      }, options.reconnectTimeout || 15 * 1000);
    };

    const createEventSource = () => {
      try {
        es = new EventSource(this.url.toString());
      } catch (err) {
        if (options.onerror) {
          options.onerror(err);
        }
      }

      createTimeout();

      es.onmessage = (message) => {
        const result = message.data
          ? this._parseRecord(JSON.parse(message.data))
          : message;
        if (result.paging_token) {
          this.url.setQuery("cursor", result.paging_token);
        }
        clearTimeout(timeout);
        createTimeout();
        if (typeof options.onmessage !== "undefined") {
          options.onmessage(result);
        }
      };

      es.onerror = (error) => {
        if (options.onerror && error instanceof MessageEvent) {
          options.onerror(error);
        }
      };

      return es;
    };

    createEventSource();
    return function close() {
      clearTimeout(timeout);
      es.close();
    };
  }

  /**
   * Sets `cursor` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/reference/paging.html)
   * @param {string} cursor A cursor is a value that points to a specific location in a collection of resources.
   * @returns {object} current CallBuilder instance
   */
  public cursor(cursor: string): this {
    this.url.setQuery("cursor", cursor);
    return this;
  }

  /**
   * Sets `limit` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/reference/paging.html)
   * @param {number} number Number of records the server should return.
   * @returns {object} current CallBuilder instance
   */
  public limit(recordsNumber: number): this {
    this.url.setQuery("limit", recordsNumber.toString());
    return this;
  }

  /**
   * Sets `order` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @param {"asc"|"desc"} direction Sort direction
   * @returns {object} current CallBuilder instance
   */
  public order(direction: "asc" | "desc"): this {
    this.url.setQuery("order", direction);
    return this;
  }

  /**
   * @private
   * @returns {void}
   */
  private checkFilter(): void {
    if (this.filter.length >= 2) {
      throw new BadRequestError("Too many filters specified", this.filter);
    }

    if (this.filter.length === 1) {
      // append filters to original segments
      const newSegment = this.originalSegments.concat(this.filter[0]);
      this.url.segment(newSegment);
    }
  }

  /**
   * Convert a link object to a function that fetches that link.
   * @private
   * @param {object} link A link object
   * @param {bool} link.href the URI of the link
   * @param {bool} [link.templated] Whether the link is templated
   * @returns {function} A function that requests the link
   */
  private _requestFnForLink(link: Horizon.ResponseLink): (opts?: any) => any {
    return async (opts: any = {}) => {
      let uri;

      if (link.templated) {
        const template = URITemplate(link.href);
        uri = URI(template.expand(opts) as any); // TODO: fix upstream types.
      } else {
        uri = URI(link.href);
      }

      const r = await this._sendNormalRequest(uri);
      return this._parseResponse(r);
    };
  }

  /**
   * Given the json response, find and convert each link into a function that
   * calls that link.
   * @private
   * @param {object} json JSON response
   * @returns {object} JSON response with string links replaced with functions
   */
  private _parseRecord(json: any): any {
    if (!json._links) {
      return json;
    }
    for (const key of Object.keys(json._links)) {
      const n = json._links[key];
      // If the key with the link name already exists, create a copy
      if (typeof json[key] !== "undefined") {
        json[`${key}_attr`] = json[key];
      }

      json[key] = this._requestFnForLink(n as Horizon.ResponseLink);
    }
    return json;
  }

  private async _sendNormalRequest(initialUrl: uri.URI) {
    let url = initialUrl;

    if (url.authority() === "") {
      url = url.authority(this.url.authority());
    }

    if (url.protocol() === "") {
      url = url.protocol(this.url.protocol());
    }

    // Temp fix for: https://github.com/stellar/js-stellar-sdk/issues/15
    url.setQuery("c", String(Math.random()));
    return HorizonAxiosClient.get(url.toString())
      .then((response) => response.data)
      .catch(this._handleNetworkError);
  }

  /**
   * @private
   * @param {object} json Response object
   * @returns {object} Extended response
   */
  private _parseResponse(json: any) {
    if (json._embedded && json._embedded.records) {
      return this._toCollectionPage(json);
    }
    return this._parseRecord(json);
  }

  /**
   * @private
   * @param {object} json Response object
   * @returns {object} Extended response object
   */
  private _toCollectionPage(json: any): any {
    for (let i = 0; i < json._embedded.records.length; i += 1) {
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: async () => {
        const r = await this._sendNormalRequest(URI(json._links.next.href));
        return this._toCollectionPage(r);
      },
      prev: async () => {
        const r = await this._sendNormalRequest(URI(json._links.prev.href));
        return this._toCollectionPage(r);
      },
    };
  }

  /**
   * @private
   * @param {object} error Network error object
   * @returns {Promise<Error>} Promise that rejects with a human-readable error
   */
  private async _handleNetworkError(error: NetworkError): Promise<void> {
    if (error.response && error.response.status && error.response.statusText) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(
            new NotFoundError(error.response.statusText, error.response.data),
          );
        default:
          return Promise.reject(
            new NetworkError(error.response.statusText, error.response.data),
          );
      }
    } else {
      return Promise.reject(new Error(error.message));
    }
  }
}
