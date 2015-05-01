"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var TransactionPage = exports.TransactionPage =

/**
* A TransactionPage contains the results of a transaction collection query,
* such as transactions or account_transactions. It holds a list
* of transaction results, which are transaction json objects. The
* TransactionPage can be passed as a parameter to the Server.nextTransactionPage()
* or Server.previousTransactionPage() to return the next/previous page of
* transactions for this query.
* @param {object} json - The response JSON from Horizon.
*/
function TransactionPage(json) {
    _classCallCheck(this, TransactionPage);

    this.records = json._embedded.records;
    this.next = json._links.next.href;
    // this.prev = json._links.previous.href;
};