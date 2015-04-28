"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var hash = _stellarBase.hash;

var Operation = require("./operation").Operation;

var Transaction = require("./transaction").Transaction;

var MAX_FEE = 1000;
var MIN_LEDGER = 0;
var MAX_LEDGER = 4294967295; // max uint32

/**
* Transaction builder helps constructs a new Transaction using the given account
* as the transaction's "source account". The transaction will use the current sequence
* number of the given account as its sequence number and increment the given account's
* sequence number by one. The given source account must include a private key for signing
* the transaction or an error will be thrown.
*
* Operations can be added to the transaction via their corresponding builder methods, and
* each returns the TransactionBuilder object so they can be chained together. After adding
* the desired operations, call the build() method on the TransactionBuilder to return a fully
* constructed Transaction that can be signed. The returned transaction will contain the
* sequence number of the source account and include the signature from the source account.
*
* The following code example creates a new transaction with two payment operations:
*
* var transaction = new TransactionBuilder(source)
*   .payment(destinationA, amount, currency)
*   .payment(destinationB, amount, currency)
*   .build();
*/

var TransactionBuilder = exports.TransactionBuilder = (function () {

    /**
    * @constructor
    * @param {Account} sourceAccount - The source account for this transaction.
    * @param {object} opts
    * @param {number} opts.maxFee - The max fee willing to pay for this transaction.
    * @param {number} opts.minLedger - The minimum ledger this transaction is valid in.
    * @param {number} opts.maxLedger - The maximum ledger this transaction is valid in.
    */

    function TransactionBuilder(source) {
        var opts = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, TransactionBuilder);

        if (!source) {
            throw new Error("must specify source account for the transaction");
        }
        this._source = source;
        this._operations = [];

        this.maxFee = opts.maxFee || MAX_FEE;
        this.minLedger = opts.minLedger || MIN_LEDGER;
        this.maxLedger = opts.maxLedger || MAX_LEDGER;

        // the signed hex form of the transaction to be sent to Horizon
        this.blob = null;
    }

    _createClass(TransactionBuilder, {
        payment: {

            /**
            * Adds a payment operation to the transaction.
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

                opts.destination = destination;
                opts.currency = currency;
                opts.amount = amount;
                var xdr = Operation.payment(opts);
                this._operations.push(xdr);
                return this;
            }
        },
        build: {

            /**
            * This will build the transaction and sign it with the source account. It will
            * also increment the source account's sequence number by 1.
            */

            value: function build() {
                var tx = new xdr.Transaction({
                    sourceAccount: this._source.masterKeypair.publicKey(),
                    maxFee: this.maxFee,
                    seqNum: xdr.SequenceNumber.fromString(String(this._source.sequence)),
                    minLedger: this.minLedger,
                    maxLedger: this.maxLedger
                });

                this._source.sequence = this._source.sequence + 1;

                tx.operations(this._operations);

                var tx_raw = tx.toXDR();

                var tx_hash = hash(tx_raw);
                var signatures = [this._source.masterKeypair.signDecorated(tx_hash)];
                var envelope = new xdr.TransactionEnvelope({ tx: tx, signatures: signatures });

                return new Transaction(envelope);
            }
        }
    });

    return TransactionBuilder;
})();