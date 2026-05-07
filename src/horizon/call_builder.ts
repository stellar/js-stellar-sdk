import { EventSource } from "eventsource";

import {
  BadRequestError,
  NetworkError,
  NotFoundError,
} from "../errors/index.js";
import { HorizonApi } from "./horizon_api.js";
import { version } from "./horizon_axios_client.js";
import type { HttpClient } from "../http-client/index.js";
import { ServerApi } from "./server_api.js";
import type { Server } from "../federation/index.js";
import { expandUriTemplate } from "../utils/url.js";

// Resources which can be included in the Horizon response via the `join`
// query-param.
const JOINABLE = ["transaction"];

export interface EventSourceOptions<T> {
  onmessage?: (
    value: T extends ServerApi.CollectionPage<infer U> ? U : T,
  ) => void;
  onerror?: (event: MessageEvent) => void;
  reconnectTimeout?: number;
}

/**
 * Creates a new {@link CallBuilder} pointed to server defined by serverUrl.
 *
 * This is an **abstract** class. Do not create this object directly, use {@link Server} class.
 * @param serverUrl - URL of Horizon server
 */
export class CallBuilder<
  T extends
    | HorizonApi.FeeStatsResponse
    | HorizonApi.BaseResponse
    | HorizonApi.RootResponse
    | ServerApi.CollectionPage<HorizonApi.BaseResponse>,
> {
  protected url: URL;

  public filter: string[][];

  protected originalSegments: string[];

  protected neighborRoot: string;

  protected httpClient: HttpClient;

  constructor(
    serverUrl: URL,
    httpClient: HttpClient,
    neighborRoot: string = "",
  ) {
    this.url = new URL(serverUrl);
    this.filter = [];

    this.originalSegments = this.url.pathname
      .split("/")
      .filter((s) => s.length > 0);
    this.neighborRoot = neighborRoot;
    this.httpClient = httpClient;
  }

  protected setPath(...segments: string[]): void {
    const endpointSegments = segments.flatMap((segment) =>
      segment.split("/").filter((s) => s.length > 0),
    );
    this.url.pathname = this.originalSegments
      .concat(endpointSegments)
      .join("/");
  }

  /**
   * Triggers a HTTP request using this builder's current configuration.
   * @returns a Promise that resolves to the server's response.
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
   * @see [Horizon Response Format](https://developers.stellar.org/api/introduction/response-format/)
   * @see [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
   * @param options - (optional) EventSource options.
   *   - `onmessage` (optional): Callback function to handle incoming messages.
   *   - `onerror` (optional): Callback function to handle errors.
   *   - `reconnectTimeout` (optional): Custom stream connection timeout in ms, default is 15 seconds.
   * @returns Close function. Run to close the connection and stop listening for new events.
   */
  public stream(
    options: EventSourceOptions<
      T extends ServerApi.CollectionPage<infer U> ? U : T
    > = {},
  ): () => void {
    this.checkFilter();

    const streamUrl = new URL(this.url);
    streamUrl.searchParams.set("X-Client-Name", "js-stellar-sdk");
    streamUrl.searchParams.set("X-Client-Version", version);

    // Extract custom app headers from httpClient defaults and add as query params
    // (EventSource doesn't support custom headers, so we use query params)
    const { headers } = this.httpClient.defaults;
    if (headers) {
      const headerNames = ["X-App-Name", "X-App-Version"];
      headerNames.forEach((name) => {
        let value: string | undefined;
        if (headers instanceof Headers) {
          value = headers.get(name) ?? undefined;
        } else if (Array.isArray(headers)) {
          const entry = headers.find(([key]) => key === name);
          value = entry?.[1];
        } else {
          value = headers[name];
        }
        if (value) {
          streamUrl.searchParams.set(name, value);
        }
      });
    }

    // EventSource object
    let es: EventSource;
    // timeout is the id of the timeout to be triggered if there were no new messages
    // in the last 15 seconds. The timeout is reset when a new message arrive.
    // It prevents closing EventSource object in case of 504 errors as `readyState`
    // property is not reliable.
    let timeout: ReturnType<typeof setTimeout>;

    const createTimeout = () => {
      timeout = setTimeout(
        () => {
          es?.close();
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          es = createEventSource();
        },
        options.reconnectTimeout || 15 * 1000,
      );
    };

    const createEventSource = (): EventSource => {
      try {
        es = new EventSource(streamUrl.toString());
      } catch (err) {
        if (options.onerror) {
          options.onerror(err as MessageEvent);
        }
      }

      createTimeout();
      if (!es) {
        return es;
      }

      // when receiving the close message from Horizon we should close the
      // connection and recreate the event source (basically retrying forever)
      let closed = false;
      const onClose = () => {
        if (closed) {
          return;
        }

        clearTimeout(timeout);

        es.close();
        createEventSource();
        closed = true;
      };

      const onMessage = (message: any) => {
        if (message.type === "close") {
          onClose();
          return;
        }

        const result = message.data
          ? this._parseRecord(JSON.parse(message.data))
          : message;
        if (result.paging_token) {
          streamUrl.searchParams.set("cursor", result.paging_token);
        }
        clearTimeout(timeout);
        createTimeout();
        if (typeof options.onmessage !== "undefined") {
          options.onmessage(result);
        }
      };

      const onError = (error: any) => {
        if (options.onerror) {
          options.onerror(error as MessageEvent);
        }
      };

      if (es.addEventListener) {
        es.addEventListener("message", onMessage.bind(this));
        es.addEventListener("error", onError.bind(this));
        es.addEventListener("close", onClose.bind(this));
      } else {
        es.onmessage = onMessage.bind(this);
        es.onerror = onError.bind(this);
      }

      return es;
    };

    createEventSource();
    return () => {
      clearTimeout(timeout);
      es?.close();
    };
  }

  /**
   * Sets `cursor` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://developers.stellar.org/api/introduction/pagination/)
   * @param cursor - A cursor is a value that points to a specific location in a collection of resources.
   * @returns current CallBuilder instance
   */
  public cursor(cursor: string): this {
    this.url.searchParams.set("cursor", cursor);
    return this;
  }

  /**
   * Sets `limit` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://developers.stellar.org/api/introduction/pagination/)
   * @param recordsNumber - Number of records the server should return.
   * @returns current CallBuilder instance
   */
  public limit(recordsNumber: number): this {
    this.url.searchParams.set("limit", recordsNumber.toString());
    return this;
  }

  /**
   * Sets `order` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @param direction - Sort direction
   * @returns current CallBuilder instance
   */
  public order(direction: "asc" | "desc"): this {
    this.url.searchParams.set("order", direction);
    return this;
  }

  /**
   * Sets `join` parameter for the current call. The `join` parameter
   * includes the requested resource in the response. Currently, the
   * only valid value for the parameter is `transactions` and is only
   * supported on the operations and payments endpoints. The response
   * will include a `transaction` field for each operation in the
   * response.
   *
   * @param include - join Records to be included in the response.
   * @returns current CallBuilder instance.
   */
  public join(include: "transactions"): this {
    this.url.searchParams.set("join", include);
    return this;
  }

  /**
   * A helper method to craft queries to "neighbor" endpoints.
   *
   *  For example, we have an `/effects` suffix endpoint on many different
   *  "root" endpoints, such as `/transactions/:id` and `/accounts/:id`. So,
   *  it's helpful to be able to conveniently create queries to the
   *  `/accounts/:id/effects` endpoint:
   *
   *    `this.forEndpoint("accounts", accountId)`.
   *
   * @param endpoint - neighbor endpoint in question, like /operations
   * @param param - filter parameter, like an operation ID
   *
   * @returns this CallBuilder instance
   */
  protected forEndpoint(endpoint: string, param: string): this {
    if (this.neighborRoot === "") {
      throw new Error("Invalid usage: neighborRoot not set in constructor");
    }
    this.filter.push([endpoint, param, this.neighborRoot]);
    return this;
  }

  /**
   * @internal
   * @returns    */
  private checkFilter(): void {
    if (this.filter.length >= 2) {
      throw new BadRequestError("Too many filters specified", this.filter);
    }

    if (this.filter.length === 1) {
      // append filters to original segments
      const newSegment = this.originalSegments.concat(this.filter[0]);
      this.url.pathname = newSegment.join("/");
    }
  }

  /**
   * Convert a link object to a function that fetches that link.
   * @internal
   * @param link - A link object
   *   - `href`: the URI of the link
   *   - `templated` (optional): Whether the link is templated
   * @returns A function that requests the link
   */
  private _requestFnForLink(
    link: HorizonApi.ResponseLink,
  ): (opts?: any) => any {
    return async (opts: any = {}) => {
      let uri;

      if (link.templated) {
        uri = new URL(expandUriTemplate(link.href, opts), this.url);
      } else {
        uri = new URL(link.href, this.url);
      }

      const r = await this._sendNormalRequest(uri);
      return this._parseResponse(r);
    };
  }

  /**
   * Given the json response, find and convert each link into a function that
   * calls that link.
   * @internal
   * @param json - JSON response
   * @returns JSON response with string links replaced with functions
   */
  private _parseRecord(json: any): any {
    if (!json._links) {
      return json;
    }
    Object.keys(json._links).forEach((key) => {
      const n = json._links[key];
      let included = false;
      // If the key with the link name already exists, create a copy
      if (typeof json[key] !== "undefined") {
        json[`${key}_attr`] = json[key];
        included = true;
      }

      /*
       If the resource can be side-loaded using `join` query-param then don't
       try to load from the server. We need to whitelist the keys which are
       joinable, since there are other keys like `ledger` which is included in
       some payloads, but doesn't represent the ledger resource, in that
       scenario we want to make the call to the server using the URL from links.
      */
      if (included && JOINABLE.indexOf(key) >= 0) {
        const record = this._parseRecord(json[key]);
        // Maintain a promise based API so the behavior is the same whether you
        // are loading from the server or in-memory (via join).
        // eslint-disable-next-line @typescript-eslint/require-await
        json[key] = async () => record;
      } else {
        json[key] = this._requestFnForLink(n as HorizonApi.ResponseLink);
      }
    });
    return json;
  }

  private async _sendNormalRequest(initialUrl: URL) {
    const url = new URL(initialUrl);

    // Always use the configured server's authority and protocol.
    // Horizon returns absolute URLs in _links that would bypass reverse proxies.
    url.protocol = this.url.protocol;
    url.host = this.url.host;

    return this.httpClient
      .get(url.toString())
      .then((response) => response.data)
      .catch(this._handleNetworkError);
  }

  /**
   * @internal
   * @param json - Response object
   * @returns Extended response
   */
  private _parseResponse(json: any) {
    if (json._embedded && json._embedded.records) {
      return this._toCollectionPage(json);
    }
    return this._parseRecord(json);
  }

  /**
   * @internal
   * @param json - Response object
   * @returns Extended response object
   */
  private _toCollectionPage(json: any): any {
    for (let i = 0; i < json._embedded.records.length; i += 1) {
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: async () => {
        const r = await this._sendNormalRequest(
          new URL(json._links.next.href, this.url),
        );
        return this._toCollectionPage(r);
      },
      prev: async () => {
        const r = await this._sendNormalRequest(
          new URL(json._links.prev.href, this.url),
        );
        return this._toCollectionPage(r);
      },
    };
  }

  /**
   * @internal
   * @param error - Network error object
   * @returns Promise that rejects with a human-readable error
   */
  private async _handleNetworkError(error: NetworkError): Promise<void> {
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(
            new NotFoundError(
              error.response.statusText ?? "Not Found",
              error.response.data,
            ),
          );
        default:
          return Promise.reject(
            new NetworkError(
              error.response.statusText ?? "Unknown",
              error.response.data,
            ),
          );
      }
    } else {
      return Promise.reject(new Error(error.message));
    }
  }
}
