"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var hash = _stellarBase.hash;
var encodeBase58Check = _stellarBase.encodeBase58Check;

var Account = require("./account").Account;

var Operation = require("./operation").Operation;

var MAX_FEE = 1000;
var MIN_LEDGER = 0;
var MAX_LEDGER = 4294967295; // max uint32

var Transaction = exports.Transaction = (function () {

    /**
    * A new Transaction object is created from a transaction envelope (or via TransactionBuilder).
    * One a Transaction has been created from an envelope, its attributes and operations
    * should not be changed. You should only add signers to a Transaction object before
    * submitting to the network or forwarding on to additional signers.
    * @constructor
    * @param {string|xdr.TransactionEnvelope} envelope - The transaction envelope.
    */

    function Transaction(envelope) {
        _classCallCheck(this, Transaction);

        if (typeof envelope === "string") {
            var buffer = new Buffer(envelope, "hex");
            envelope = xdr.fromXdr(buffer);
        }
        // since this transaction is immutable, save the tx
        this.tx = envelope._attributes.tx;
        this.source = encodeBase58Check("accountId", envelope._attributes.tx._attributes.sourceAccount);
        this.maxFee = envelope._attributes.tx._attributes.maxFee;
        this.sequence = envelope._attributes.tx._attributes.seqNum.toString();
        this.minLedger = envelope._attributes.tx._attributes.minLedger;
        this.maxLedger = envelope._attributes.tx._attributes.maxLedger;
        var operations = envelope._attributes.tx._attributes.operations;
        this.operations = [];
        for (var i = 0; i < operations.length; i++) {
            this.operations[i] = Operation.operationToObject(operations[i]._attributes.body);
        }
        var signatures = envelope._attributes.signatures;
        this.signatures = [];
        for (var i = 0; i < signatures.length; i++) {
            this.signatures[i] = signatures[i];
        }
    }

    _createClass(Transaction, {
        addSignature: {

            /**
            * Adds a signature to this transaction.
            * @param signature
            */

            value: function addSignature(signature) {
                this.signatures.push(signature);
            }
        },
        sign: {

            /**
            * Signs the transaction with the given account's master key and returns the
            * signature string, which can then be added to the transaction via addSignature()
            * or forwarded on.
            */

            value: function sign(account) {
                var tx_raw = this.tx.toXDR();
                var tx_hash = hash(tx_raw);
                return account.masterKeypair.signDecorated(tx_hash);
            }
        },
        toEnvelope: {

            /**
            * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
            */

            value: function toEnvelope() {
                var tx = this.tx;
                var signatures = this.signatures;
                var envelope = new xdr.TransactionEnvelope({ tx: tx, signatures: signatures });

                return envelope;
            }
        }
    });

    return Transaction;
})();