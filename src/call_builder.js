import forEach from 'lodash/forEach';
import URI from 'urijs';
import URITemplate from 'urijs/src/URITemplate';
import isNode from 'detect-node';

import HorizonAxiosClient from './horizon_axios_client';
import { version } from '../package.json';
import { NotFoundError, NetworkError, BadRequestError } from './errors';

let EventSource;

if (isNode) {
  // eslint-disable-next-line
  EventSource = require('eventsource');
} else {
  // eslint-disable-next-line
  EventSource = window.EventSource;
}

/**
 * Creates a new {@link CallBuilder} pointed to server defined by serverUrl.
 *
 * This is an **abstract** class. Do not create this object directly, use {@link Server} class.
 * @param {string} serverUrl URL of Horizon server
 * @class CallBuilder
 */
export class CallBuilder {
  constructor(serverUrl) {
    this.url = serverUrl;
    this.filter = [];
    this.originalSegments = this.url.segment() || [];
  }

  /**
   * @private
   * @returns {void}
   */
  checkFilter() {
    if (this.filter.length >= 2) {
      throw new BadRequestError('Too many filters specified', this.filter);
    }

    if (this.filter.length === 1) {
      // append filters to original segments
      const newSegment = this.originalSegments.concat(this.filter[0]);
      this.url.segment(newSegment);
    }
  }

  /**
   * Triggers a HTTP request using this builder's current configuration.
   * @returns {Promise} a Promise that resolves to the server's response.
   */
  call() {
    this.checkFilter();
    return this._sendNormalRequest(this.url).then((r) =>
      this._parseResponse(r)
    );
  }

  /**
   * Creates an EventSource that listens for incoming messages from the server. To stop listening for new
   * events call the function returned by this method.
   * @see [Horizon Response Format](https://www.stellar.org/developers/horizon/learn/responses.html)
   * @see [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
   * @param {object} [options] EventSource options.
   * @param {function} [options.onmessage] Callback function to handle incoming messages.
   * @param {function} [options.onerror] Callback function to handle errors.
   * @param {number} [options.reconnectTimeout] Custom stream connection timeout in ms, default is 15 seconds.
   * @returns {function} Close function. Run to close the connection and stop listening for new events.
   */
  stream(options = {}) {
    this.checkFilter();

    this.url.setQuery('X-Client-Name', 'js-stellar-sdk');
    this.url.setQuery('X-Client-Version', version);

    // EventSource object
    let es;
    // timeout is the id of the timeout to be triggered if there were no new messages
    // in the last 15 seconds. The timeout is reset when a new message arrive.
    // It prevents closing EventSource object in case of 504 errors as `readyState`
    // property is not reliable.
    let timeout;

    const createTimeout = () => {
      timeout = setTimeout(() => {
        es.close();
        es = createEventSource();
      }, options.reconnectTimeout || 15 * 1000);
    };

    const createEventSource = () => {
      try {
        es = new EventSource(this.url.toString());
      } catch (err) {
        if (options.onerror) {
          options.onerror(err);
          options.onerror('EventSource not supported');
        }
        return false;
      }

      createTimeout();

      es.onmessage = (message) => {
        const result = message.data
          ? this._parseRecord(JSON.parse(message.data))
          : message;
        if (result.paging_token) {
          this.url.setQuery('cursor', result.paging_token);
        }
        clearTimeout(timeout);
        createTimeout();
        options.onmessage(result);
      };

      es.onerror = (error) => {
        if (options.onerror) {
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
   * Convert a link object to a function that fetches that link.
   * @private
   * @param {object} link A link object
   * @param {bool} link.href the URI of the link
   * @param {bool} [link.templated] Whether the link is templated
   * @returns {function} A function that requests the link
   */
  _requestFnForLink(link) {
    return (opts) => {
      let uri;

      if (link.templated) {
        const template = URITemplate(link.href);
        uri = URI(template.expand(opts || {}));
      } else {
        uri = URI(link.href);
      }

      return this._sendNormalRequest(uri).then((r) => this._parseResponse(r));
    };
  }

  /**
   * Given the json response, find and convert each link into a function that
   * calls that link.
   * @private
   * @param {object} json JSON response
   * @returns {object} JSON response with string links replaced with functions
   */
  _parseRecord(json) {
    if (!json._links) {
      return json;
    }
    forEach(json._links, (n, key) => {
      // If the key with the link name already exists, create a copy
      if (typeof json[key] !== 'undefined') {
        // eslint-disable-next-line no-param-reassign
        json[`${key}_attr`] = json[key];
      }

      // eslint-disable-next-line no-param-reassign
      json[key] = this._requestFnForLink(n);
    });
    return json;
  }

  _sendNormalRequest(initialUrl) {
    let url = initialUrl;

    if (url.authority() === '') {
      url = url.authority(this.url.authority());
    }

    if (url.protocol() === '') {
      url = url.protocol(this.url.protocol());
    }

    // Temp fix for: https://github.com/stellar/js-stellar-sdk/issues/15
    url.setQuery('c', Math.random());
    return HorizonAxiosClient.get(url.toString())
      .then((response) => response.data)
      .catch(this._handleNetworkError);
  }

  /**
   * @private
   * @param {object} json Response object
   * @returns {object} Extended response
   */
  _parseResponse(json) {
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
  _toCollectionPage(json) {
    for (let i = 0; i < json._embedded.records.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: () =>
        this._sendNormalRequest(URI(json._links.next.href)).then((r) =>
          this._toCollectionPage(r)
        ),
      prev: () =>
        this._sendNormalRequest(URI(json._links.prev.href)).then((r) =>
          this._toCollectionPage(r)
        )
    };
  }

  /**
   * @private
   * @param {object} error Network error object
   * @returns {Promise<Error>} Promise that rejects with a human-readable error
   */
  _handleNetworkError(error) {
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(
            new NotFoundError(error.response.statusText, error.response.data)
          );
        default:
          return Promise.reject(
            new NetworkError(error.response.statusText, error.response.data)
          );
      }
    } else {
      return Promise.reject(new Error(error));
    }
  }

  /**
   * Sets `cursor` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {string} cursor A cursor is a value that points to a specific location in a collection of resources.
   * @returns {object} current CallBuilder instance
   */
  cursor(cursor) {
    this.url.setQuery('cursor', cursor);
    return this;
  }

  /**
   * Sets `limit` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {number} number Number of records the server should return.
   * @returns {object} current CallBuilder instance
   */
  limit(number) {
    this.url.setQuery('limit', number);
    return this;
  }

  /**
   * Sets `order` parameter for the current call. Returns the CallBuilder object on which this method has been called.
   * @param {"asc"|"desc"} direction Sort direction
   * @returns {object} current CallBuilder instance
   */
  order(direction) {
    this.url.setQuery('order', direction);
    return this;
  }
}
