import {xdr, hash, encodeBase58Check} from "stellar-base";

import {Account} from "./account";
import {Operation} from "./operation";

let MAX_FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

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
        this.source = encodeBase58Check("accountId", envelope._attributes.tx._attributes.sourceAccount);
        this.maxFee = envelope._attributes.tx._attributes.maxFee;
        this.sequence = envelope._attributes.tx._attributes.seqNum.toString();
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
        return account.masterKeypair.signDecorated(tx_hash);
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