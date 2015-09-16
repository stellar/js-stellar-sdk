import {NotFoundError, NetworkError, BadRequestError} from "./errors";

let URI = require("URIjs");
let URITemplate = require('URIjs/src/URITemplate');


let axios = require("axios");
var EventSource = (typeof window === 'undefined') ? require('eventsource') : window.EventSource;
let toBluebird = require("bluebird").resolve;

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

    call() {
        this.checkFilter();
        var promise = this._sendNormalRequest(this.url)
            .then(this._parseResponse.bind(this));
        return promise;
    }

    /**
    * Convert each link into a function on the response object.
    */
    _parseRecord(json) {
        if (!json._links) {
            return json;
        }
        var self = this;
        var linkFn = function (link) {
            return function (opts) {
                if (link.template) {
                    let template = URITemplate(link.href);
                    return self._sendNormalRequest(URI(template.expand(opts)));
                } else {
                    return self._sendNormalRequest(URI(link.href));
                }
            };
        };
        Object.keys(json._links).map(function(value, index) {
            var link = json._links[value];
            json[value] = linkFn(link);
        });
        return json;
    }
    
    _sendNormalRequest(url) {
        // To fix:  #15 Connection Stalled when making multiple requests to the same resource
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
        var self = this;
        for (var i = 0; i < json._embedded.records.length; i++) {
            json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
        }
        return {
            records: json._embedded.records,
            next: function () {
                return self._sendNormalRequest(URI(json._links.next.href))
                    .then(self._toCollectionPage.bind(self));
            },
            prev: function () {
                return self._sendNormalRequest(URI(json._links.prev.href))
                    .then(self._toCollectionPage.bind(self));
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

    after(token) {
        this.url.addQuery("after", token);
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

    stream(options) {
        this.checkFilter();
        var es = new EventSource(this.url.toString());
        es.onmessage = function (message) {
            var result = message.data ? JSON.parse(message.data) : message;
            options.onmessage(result);
        };
        es.onerror = options.onerror;
        return es;
    }

}