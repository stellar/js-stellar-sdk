"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var Hyper = _stellarBase.Hyper;
var hash = _stellarBase.hash;
var encodeBase58Check = _stellarBase.encodeBase58Check;

var Account = require("./account").Account;

var Currency = require("./currency").Currency;

var Operation = exports.Operation = (function () {
    function Operation() {
        _classCallCheck(this, Operation);
    }

    _createClass(Operation, null, {
        payment: {
            /**
            * Returns a the xdr representation of a payment operation.
            * @param {object}   opts
            * @param {Account}  opts.destination    - The destination account for the payment.
            * @param {Currency} opts.currency       - The currency to send
            * @param {string|number} otps.amount    - The amount to send.
            * @param {Account}  [opts.source]       - The source account for the payment. Defaults to the transaction's source account.
            * @param {array}    [opts.path]         - An array of Currency objects to use as the path.
            * @param {string}   [opts.sendMax]      - The max amount of currency to send.
            * @param {string}   [opts.sourceMemo]   - The source memo.
            * @param {string}   [opts.memo]         - The memo.
            */

            value: function payment(opts) {
                if (!opts.destination) {
                    throw new Error("Must provide a destination for a payment operation");
                }
                if (!opts.currency) {
                    throw new Error("Must provide a currency for a payment operation");
                }
                if (!opts.amount) {
                    throw new Error("Must provide an amount for a payment operation");
                }
                var destinationPublicKey = opts.destination.masterKeypair.publicKey();
                var currencyXdr = opts.currency.toXdrObject();
                var value = Hyper.fromString(String(opts.amount));
                var sourcePublicKey = opts.source ? opts.source.masterKeypair : null;
                var path = opts.path ? opts.path : [];
                var sendMax = opts.sendMax ? Hyper.fromString(String(opts.sendMax)) : value;
                var sourceMemo = null;
                var memo = null;
                if (opts.sourceMemo) {
                    sourceMemo = opts.sourceMemo;
                } else {
                    sourceMemo = new Buffer(32);
                    sourceMemo.fill(0);
                }
                if (opts.memo) {
                    memo = opts.memo;
                } else {
                    memo = new Buffer(32);
                    memo.fill(0);
                }

                var payment = new xdr.PaymentOp({
                    destination: destinationPublicKey,
                    currency: currencyXdr,
                    path: path,
                    amount: value,
                    sendMax: sendMax,
                    sourceMemo: sourceMemo,
                    memo: memo });

                var op = new xdr.Operation({
                    body: xdr.OperationBody.payment(payment) });

                return op;
            }
        },
        operationToObject: {

            /**
            * Converts the xdr form of an operation to its object form.
            */

            value: function operationToObject(operation) {
                var obj = {};
                var attrs = operation._value._attributes;
                switch (operation._arm) {
                    case "paymentOp":
                        obj.type = "paymentOp";
                        obj.destination = Account.fromAddress(encodeBase58Check("accountId", attrs.destination));
                        obj.currency = attrs.currency._switch.name == "native" ? Currency.native() : null;
                        obj.path = attrs.path;
                        obj.amount = attrs.amount.toString();
                        obj.sendMax = attrs.sendMax.toString();
                        obj.sourceMemo = attrs.sourceMemo;
                        obj.memo = attrs.memo;
                        break;
                }
                return obj;
            }
        },
        objectToOperation: {
            value: function objectToOperation(obj) {
                switch (obj.type) {
                    case "paymentOp":
                        return Operation.payment(obj);
                }
            }
        }
    });

    return Operation;
})();