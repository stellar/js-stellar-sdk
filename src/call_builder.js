import {NotFoundError, NetworkError, BadRequestError} from "./errors";
import forEach from 'lodash/forEach';

let URI = require("urijs");
let URITemplate = require("urijs/src/URITemplate");

let axios = require("axios");
var EventSource = (typeof window === 'undefined') ? require('eventsource') : window.EventSource;
let toBluebird = require("bluebird").resolve;

/**
 * Creates a new {@link CallBuilder} pointed to server defined by serverUrl.
 *
 * This is an **abstract** class. Do not create this object directly, use {@link Server} class.
 * @param {string} serverUrl
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
   */
  checkFilter() {
    if (this.filter.length >= 2) {
      throw new BadRequestError("Too many filters specified", this.filter);
    }

    if (this.filter.length === 1) {
      //append filters to original segments
      let newSegment = this.originalSegments.concat(this.filter[0]);
      this.url.segment(newSegment);
    }        
  }

  /**
   * Triggers a HTTP request using this builder's current configuration.
   * Returns a Promise that resolves to the server's response.
   * @returns {Promise}
   */
  call() {
    this.checkFilter();
    return this._sendNormalRequest(this.url)
      .then(r => this._parseResponse(r));
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
  stream(options) {
    this.checkFilter();

    // EventSource object
    let es;
    // timeout is the id of the timeout to be triggered if there were no new messages
    // in the last 15 seconds. The timeout is reset when a new message arrive.
    // It prevents closing EventSource object in case of 504 errors as `readyState`
    // property is not reliable.
    let timeout;

    var createTimeout = () => {
      timeout = setTimeout(() => {
        es.close();
        es = createEventSource();
      }, options.reconnectTimeout || 15*1000);
    };

    var createEventSource = () => {
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

      es.onmessage = message => {
        var result = message.data ? this._parseRecord(JSON.parse(message.data)) : message;
        if (result.paging_token) {
          this.url.setQuery("cursor", result.paging_token);
        }
        clearTimeout(timeout);
        createTimeout();
        options.onmessage(result);
      };

      es.onerror = error => {
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
   * @private
   */
  _requestFnForLink(link) {
    return opts => {
      let uri;

      if (link.templated) {
        let template = URITemplate(link.href);
        uri = URI(template.expand(opts || {}));
      } else {
        uri = URI(link.href);
      }

      return this._sendNormalRequest(uri).then(r => this._parseResponse(r));
    };
  } 

  /**
   * Convert each link into a function on the response object.
   * @private
   */
  _parseRecord(json) {
    if (!json._links) {
      return json;
    }
    forEach(json._links, (n, key) => {
      // If the key with the link name already exists, create a copy
      if (typeof json[key] != 'undefined') {
        json[`${key}_attr`] = json[key];
      }
      json[key] = this._requestFnForLink(n);
    });
    return json;
  }
  
  _sendNormalRequest(url) {
    if (url.authority() === '') {
      url = url.authority(this.url.authority());
    }

    if (url.protocol() === '') {
      url = url.protocol(this.url.protocol());
    }

    // Temp fix for: https://github.com/stellar/js-stellar-sdk/issues/15
    url.setQuery('c', Math.random());
    var promise = axios.get(url.toString())
      .then(response => response.data)
      .catch(this._handleNetworkError);
    return toBluebird(promise);
  }

  /**
   * @private
   */
  _parseResponse(json) {
    if (json._embedded && json._embedded.records) {
      return this._toCollectionPage(json);
    } else {
      return this._parseRecord(json);
    }
  }

  /**
   * @private
   */
  _toCollectionPage(json) {
    for (var i = 0; i < json._embedded.records.length; i++) {
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: () => {
        return this._sendNormalRequest(URI(json._links.next.href))
          .then(r => this._toCollectionPage(r));
      },
      prev: () => {
        return this._sendNormalRequest(URI(json._links.prev.href))
          .then(r => this._toCollectionPage(r));
      }
    };
  }

  /**
   * @private
   */
  _handleNetworkError(response) {
    if (response instanceof Error) {
      return Promise.reject(response);
    } else {
      switch (response.status) {
        case 404:
          return Promise.reject(new NotFoundError(response.data, response));
        default:
          return Promise.reject(new NetworkError(response.status, response));
      }
    }
  }

  /**
   * Adds `cursor` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {string} cursor A cursor is a value that points to a specific location in a collection of resources.
   */
  cursor(cursor) {
    this.url.addQuery("cursor", cursor);
    return this;
  }

  /**
   * Adds `limit` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {number} number Number of records the server should return.
   */
  limit(number) {
    this.url.addQuery("limit", number);
    return this;
  }

  /**
   * Adds `order` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @param {"asc"|"desc"} direction
   */
  order(direction) {
    this.url.addQuery("order", direction);
    return this;
  }
}
