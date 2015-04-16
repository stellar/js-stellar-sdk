"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var Hyper = _stellarBase.Hyper;

var Account = require("./account").Account;

var MAX_FEE = 1000;
var MIN_LEDGER = 0;
var MAX_LEDGER = 4294967295; // max uint32

var Transaction = exports.Transaction = (function () {

    /**
    * @constructor
    * @param {Account} sourceAccount - The source account for this transaction.
    * @param {object} opts
    * @param {number} opts.maxFee - The max fee willing to pay for this transaction.
    * @param {number} opts.minLedger - The minimum ledger this transaction is valid in.
    * @param {number} opts.maxLedger - The maximum ledger this transaction is valid in.
    */

    function Transaction(source) {
        var opts = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Transaction);

        if (!source) {
            throw new Error("must specify source account for the transaction");
        }
        this._source = source;
        this._operations = [];

        this.maxFee = opts.maxFee || MAX_FEE;
        this.minLedger = opts.minLedger || MIN_LEDGER;
        this.maxLedger = opts.maxLedger || MAX_LEDGER;

        this.signed = null;
    }

    _createClass(Transaction, {
        payment: {

            /**
            * Adds a new payment operation to this transaction.
            * @param {Account}  destination         - The destination account for the payment.
            * @param {Currency} currency            - The currency to send
            * @param {string|number} amount         - The amount to send.
            * @param {object}   opts
            * @param {Account}  [opts.source]       - The source account for the payment. Defaults to the transaction's source account.
            * @param {array}    [opts.path]         - An array of Currency objects to use as the path.
            * @param {string}   [opts.sendMax]      - The max amount of currency to send.
            * @param {string}   [opts.sourceMemo]   - The source memo.
            * @param {string}   [opts.memo]         - The memo.
            */

            value: function payment(destination, currency, amount) {
                var opts = arguments[3] === undefined ? {} : arguments[3];

                if (!destination) {
                    throw new Error("Must provide a destination for a payment operation");
                }
                if (!currency) {
                    throw new Error("Must provide a currency for a payment operation");
                }
                if (!amount) {
                    throw new Error("Must provide an amount for a payment operation");
                }
                var destinationPublicKey = destination.masterKeypair.publicKey();
                var currencyXdr = currency.toXdrObject();
                var value = Hyper.fromString(String(amount));
                var sourcePublicKey = opts.source ? opts.source.masterKeypair : null;
                var path = opts.path ? opts.path : [];
                var sendMax = opts.sendMax ? opts.sendMax : Hyper.fromString(String(amount));
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
                    sendMax: Hyper.fromString("200000000"),
                    sourceMemo: sourceMemo,
                    memo: memo });

                var op = new xdr.Operation({
                    sourceAccount: sourcePublicKey,
                    body: xdr.OperationBody.payment(payment)
                });

                this._operations.push(op);
            }
        },
        serialize: {
            value: function serialize() {
                var source = this._source;

                var tx = new xdr.Transaction({
                    sourceAccount: source.masterKeypair.publicKey(),
                    maxFee: this.maxFee,
                    seqNum: xdr.SequenceNumber.fromString(String(source.seqNum)),
                    minLedger: this.minLedger,
                    maxLedger: this.maxLedger
                });
                tx.operations(this._operations);

                return tx.toXDR();
            }
        }
    });

    return Transaction;
})();