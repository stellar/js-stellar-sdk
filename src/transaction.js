import {xdr, Hyper, hash, encodeBase58Check} from "stellar-base";

import {Account} from "./account";
import {Currency} from "./currency";
import {Operation} from "./operation";

let MAX_FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

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
export class TransactionBuilder {

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
    payment(destination, currency, amount, opts={}) {
        opts.destination = destination;
        opts.currency = currency;
        opts.amount = amount;
        let xdr = Operation.payment(opts);
        this._operations.push(xdr);
        return this;
    }

    /**
    * This will build the transaction and sign it with the source account. It will
    * also increment the source account's sequence number by 1.
    */
    build() {
        let tx = new xdr.Transaction({
          sourceAccount: this._source.masterKeypair.publicKey(),
          maxFee:        this.maxFee,
          seqNum:        xdr.SequenceNumber.fromString(String(this._source.seqNum)),
          minLedger:     this.minLedger,
          maxLedger:     this.maxLedger
        });

        this._source.seqNum = this._source.seqNum + 1;

        tx.operations(this._operations);

        let tx_raw = tx.toXDR();

        let tx_hash    = hash(tx_raw);
        let signatures = [this._source.masterKeypair.signDecorated(tx_hash)];
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        return new Transaction(envelope);
    }
}

/**
* A transaction contains a set of operations and signatures on one or more accounts.
* It can not be mutated (ie no new operations can be added to the transaction), as
* the signatures associated with this transaction have already signed the transaction.
*/
export class Transaction {

    /**
    * Constructs a new Transaction object from the given TransactionEnvelope object,
    * or hex blob data.
    * @constructor
    * @param {string|xdr.TransactionEnvelope} envelope - The transaction envelope.
    */
    constructor(envelope) {
        if (typeof envelope === "string") {
            let buffer = new Buffer(envelope, "hex");
            envelope = xdr.fromXdr(buffer);
        }
        // since this transaction is immutable, save the tx
        this.tx = envelope._attributes.tx;
        let address = encodeBase58Check("accountId", envelope._attributes.tx._attributes.sourceAccount);
        this.source = Account.fromAddress(address);
        this.maxFee = envelope._attributes.tx._attributes.maxFee;
        this.seqNum = envelope._attributes.tx._attributes.seqNum.toString();
        this.minLedger = envelope._attributes.tx._attributes.minLedger;
        this.maxLedger = envelope._attributes.tx._attributes.maxLedger;
        let operations = envelope._attributes.tx._attributes.operations;
        this.operations = [];
        for (let i = 0; i < operations.length; i++) {
            this.operations[i] = Operation.operationToObject(operations[i]._attributes.body);
        }
        let signatures = envelope._attributes.signatures;
        this.signatures = [];
        for (let i = 0; i < signatures.length; i++) {
            this.signatures[i] = signatures[i];
        }
    }

    /**
    * Adds a signature to this transaction.
    * @param signature
    */
    addSignature(signature) {
        this.signatures.push(signature);
    }

    /**
    * Signs the transaction with the given account and returns the signature string.
    */
    sign(account) {
        let tx_raw = this.tx.toXDR();
        let tx_hash = hash(tx_raw);
        return this._source.masterKeypair.signDecorated(tx_hash);
    }

    /**
    * To envelope returns a xdr.TransactionEnvelope containing this transaction and signatures
    * which can be submitted to the network.
    */
    toEnvelope() {
        let tx = this.tx;
        let signatures = this.signatures;
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        return envelope;
    }
}