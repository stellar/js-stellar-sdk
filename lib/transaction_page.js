"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var ResultPage = exports.ResultPage =

/**
* A page of a result collection.
* @param {object} json - The response JSON from Horizon.
*/
function ResultPage(json) {
    _classCallCheck(this, ResultPage);

    this.records = json._embedded.records;
    this.next = json._links.next.href;
    // this.prev = json._links.prev.href;
    // this.prev = json._links.previous.href;
};