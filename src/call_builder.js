import {NotFoundError, NetworkError, BadRequestError} from "./errors";

let URI = require("URIjs");
let URITemplate = require("URIjs").URITemplate;

let axios = require("axios");
var EventSource = (typeof window === 'undefined') ? require('eventsource') : window.EventSource;
let toBluebird = require("bluebird").resolve;
let _ = require('lodash');

/**
* @class Builder
*/
export class CallBuilder {

  /*
  * @constructor
  */
  constructor(url) {
    this.url = url;
    this.filter = [];
  }

  checkFilter() {
    if (this.filter.length >= 2) {
      throw new BadRequestError("Too many filters specified", this.filter);
    } 
    if (this.filter.length === 1) {
      this.url.segment(this.filter[0]);
    }        
  }

  /*
  * Triggers a HTTP request using this builder's current configuration.
  * Returns a Promise that resolves to the server's response.
  */
  call() {
    this.checkFilter();
    var promise = this._sendNormalRequest(this.url)
      .then(r => this._parseResponse(r));
    return promise;
  }

  /*
  * Creates an Eventsource that listens for incoming messages from the server.
  * URL based on builder's current configuration.
  */
  stream(options) {
    this.checkFilter();
    try {
      var es = new EventSource(this.url.toString());
      es.onmessage = (message) => {
        var result = message.data ? this._parseRecord(JSON.parse(message.data)) : message;
        options.onmessage(result);
      };
      es.onerror = options.onerror;
      return es;
    } catch (err) {
      if (options.onerror) {
        options.onerror('EventSource not supported');
      }
      return false;
    }
  }

  _requestFnForLink(link) {
    return opts => {
      let uri;

      if (link.template) {
        let template = URITemplate(link.href);
        uri = URI(template.expand(opts));
      } else {
        uri = URI(link.href);
      }

      uri = uri
        .authority(this.url.authority())
        .protocol(this.url.protocol());

      return this._sendNormalRequest(uri).then(r => this._parseRecord(r));
    };
  } 

  /**
  * Convert each link into a function on the response object.
  */
  _parseRecord(json) {
    if (!json._links) {
      return json;
    }
    _.forEach(json._links, (n, key) => {json[key] = this._requestFnForLink(n);});
    return json;
  }
  
  _sendNormalRequest(url) {
    url.addQuery('c', Math.random());
    var promise = axios.get(url.toString())
      .then(response => response.data)
      .catch(this._handleNetworkError);
    return toBluebird(promise);
  }

  _parseResponse(json) {
    if (json._embedded && json._embedded.records) {
      return this._toCollectionPage(json);
    } else {
      return this._parseRecord(json);
    }
  }

  _toCollectionPage(json) {
    for (var i = 0; i < json._embedded.records.length; i++) {
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: () => {
        return this._sendNormalRequest(URI(json._links.next.href)
          .authority(this.url.authority())
          .protocol(this.url.protocol())
          )
          .then(r => this._toCollectionPage(r));
      },
      prev: () => {
        return this._sendNormalRequest(URI(json._links.prev.href)
          .authority(this.url.authority())
          .protocol(this.url.protocol())
          )
          .then(r => this._toCollectionPage(r));
      }
    };
  }

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

  cursor(token) {
    this.url.addQuery("cursor", token);
    return this;
  }

  limit(number) {
    this.url.addQuery("limit", number);
    return this;
  }

  order(direction) {
    this.url.addQuery("order", direction);
    return this;
  }



}
