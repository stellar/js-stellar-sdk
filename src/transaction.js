import {xdr, Hyper, hash} from "stellar-base";

import {Account} from "./account";

let MAX_FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

export class Transaction {

    /**
    * @constructor
    * @param {Account} sourceAccount - The source account for this transaction.
    * @param {object} opts
    * @param {number} opts.maxFee - The max fee willing to pay for this transaction.
    * @param {number} opts.minLedger - The minimum ledger this transaction is valid in.
    * @param {number} opts.maxLedger - The maximum ledger this transaction is valid in.
    */
    constructor(source, opts={}) {
        if (!source) {
            throw new Error("must specify source account for the transaction");
        }
        this._source        = source;
        this._operations    = [];

        this.maxFee     = opts.maxFee || MAX_FEE;
        this.minLedger  = opts.minLedger || MIN_LEDGER;
        this.maxLedger  = opts.maxLedger || MAX_LEDGER;

        // the signed hex form of the transaction to be sent to Horizon
        this.blob = null;
    }

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
    payment(destination, currency, amount, opts={}) {
        if (!destination) {
            throw new Error("Must provide a destination for a payment operation");
        }
        if (!currency) {
            throw new Error("Must provide a currency for a payment operation");
        }
        if (!amount) {
            throw new Error("Must provide an amount for a payment operation");
        }
        let destinationPublicKey    = destination.masterKeypair.publicKey();
        let currencyXdr             = currency.toXdrObject();
        let value                   = Hyper.fromString(String(amount));
        let sourcePublicKey         = opts.source ? opts.source.masterKeypair : null;
        let path                    = opts.path ? opts.path : [];
        let sendMax                 = opts.sendMax ? Hyper.fromString(String(opts.sendMax)) : value;
        let sourceMemo              = null;
        let memo                    = null;
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

        let payment = new xdr.PaymentOp({
          destination: destinationPublicKey,
          currency:    currencyXdr,
          path:        path,
          amount:      value,
          sendMax:     sendMax,
          sourceMemo:  sourceMemo,
          memo:        memo,
        });

        let op = new xdr.Operation({
            body: xdr.OperationBody.payment(payment),
        });
        this._operations.push(op);
    }

    sign() {
        let tx = new xdr.Transaction({
          sourceAccount: this._source.masterKeypair.publicKey(),
          maxFee:        this.maxFee,
          seqNum:        xdr.SequenceNumber.fromString(String(this._source.seqNum)),
          minLedger:     this.minLedger,
          maxLedger:     this.maxLedger
        });

        tx.operations(this._operations);

        let tx_raw = tx.toXDR();

        let tx_hash    = hash(tx_raw);
        let signatures = [this._source.masterKeypair.signDecorated(tx_hash)];
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        this.blob = envelope.toXDR("hex");
    }
}