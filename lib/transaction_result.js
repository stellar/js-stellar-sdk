"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
* @class TransactionResult
*/

var TransactionResult = exports.TransactionResult =

/**
* <pre>
* A TransactionResult contains the results for a submitted transaction to the server.
* {
*   // the fee charged for the transaction
*   feeCharged:
*   // the TransactionResultCode
*   result: {name, value}
*   operationResults: [
*       {
*           // the OperationType
*           type: {name, value}
*           // OperationResultCode
*           result: {name, value}
*           // the OperationResultTr result, null unless OperationResultCode == opInner
*           value: {name, value}
*       }
*   ]
* }
* </pre>
* @constructor
* @param {string} json - Response JSON from server.
*/
function TransactionResult(json) {
    _classCallCheck(this, TransactionResult);

    this.feeCharged = json._attributes.feeCharged.toString();
    this.result = {
        name: json._attributes.result._switch.name,
        value: json._attributes.result._switch.value
    };
    this.operationResults = [];
    var opResults = json._attributes.result._value;
    for (var i = 0; opResults && i < opResults.length; i++) {
        var result = {};
        var opResult = opResults[i];
        result.type = {
            name: opResult._value._switch.name,
            value: opResult._value._switch.value
        };
        result.result = {
            name: opResult._switch.name,
            value: opResult._switch.value
        };
        result.value = {
            name: opResult._value._value._switch.name,
            value: opResult._value._value._switch.value
        };
        this.operationResults[i] = result;
    }
};