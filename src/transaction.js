import {xdr, hash, encodeBase58Check} from "stellar-base";

import {Account} from "./account";
import {Operation} from "./operation";

let MAX_FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

export class Transaction {

    /**
    * A new Transaction object is created from a transaction envelope (or via TransactionBuilder).
    * One a Transaction has been created from an envelope, its attributes and operations
    * should not be changed. You should only add signers to a Transaction object before
    * submitting to the network or forwarding on to additional signers.
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
    * Signs the transaction with the given account's master key and returns the
    * signature string, which can then be added to the transaction via addSignature()
    * or forwarded on.
    */
    sign(account) {
        let tx_raw = this.tx.toXDR();
        let tx_hash = hash(tx_raw);
        return account.masterKeypair.signDecorated(tx_hash);
    }

    /**
    * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
    */
    toEnvelope() {
        let tx = this.tx;
        let signatures = this.signatures;
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        return envelope;
    }
}