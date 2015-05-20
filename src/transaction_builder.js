import {xdr, hash, Keypair} from "stellar-base";

import {Operation} from "./operation";
import {Transaction} from "./transaction";
import {Memo} from "./memo";

let FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

/**
* @class TransactionBuilder
*/
export class TransactionBuilder {

    /**
    * <p>Transaction builder helps constructs a new Transaction using the given account
    * as the transaction's "source account". The transaction will use the current sequence
    * number of the given account as its sequence number and increment the given account's
    * sequence number by one. The given source account must include a private key for signing
    * the transaction or an error will be thrown.</p>
    *
    * <p>Operations can be added to the transaction via their corresponding builder methods, and
    * each returns the TransactionBuilder object so they can be chained together. After adding
    * the desired operations, call the build() method on the TransactionBuilder to return a fully
    * constructed Transaction that can be signed. The returned transaction will contain the
    * sequence number of the source account and include the signature from the source account.</p>
    *
    * <p>The following code example creates a new transaction with two payment operations
    * and a changeTrust operation. The Transaction's source account first funds destinationA,
    * then extends a trust line to destination A for a currency, then destinationA sends the
    * source account an amount of that currency. The built transaction would need to be signed by
    * both the source acccount and the destinationA account for it to be valid.</p>
    *
    * <pre>var transaction = new TransactionBuilder(source)
    *   .addOperation(Operation.payment({
            destination: destinationA,
            amount: "20000000",
            currency: Currency.native()
        }) // <- funds and creates destinationA
    *   .build();
    * </pre>
    * @constructor
    * @param {Account} sourceAccount - The source account for this transaction.
    * @param {object} [opts]
    * @param {number} [opts.fee] - The max fee willing to pay for this transaction.
    * @param {object} [opts.timebounds] - The timebounds for the validity of this transaction.
    * @param {string} [opts.timebounds.minTime] - 64 bit unix timestamp
    * @param {string} [opts.timebounds.maxTime] - 64 bit unix timestamp
    * @param {Memo} [opts.memo] - The memo for the transaction
    * @param {}
    */
    constructor(source, opts={}) {
        if (!source) {
            throw new Error("must specify source account for the transaction");
        }
        this.source        = source;
        this.operations    = [];
        this.signers       = [];

        this.fee        = opts.fee || FEE;
        this.timebounds = opts.timebounds;

        this.memo       = opts.memo || Memo.none();

        // the signed hex form of the transaction to be sent to Horizon
        this.blob = null;
    }

    /**
    * Adds an operation to the transaction.
    * @param {xdr.Operation} The xdr operation object, use {@link Operation} static methods.
    */
    addOperation(operation) {
        this.operations.push(operation);
        return this;
    }

    /**
    * Adds the given signer's signature to the transaction.
    */
    addSigner(keypair) {
        this.signers.push(keypair);
        return this;
    }

    /**
    * This will build the transaction and sign it with the source account. It will
    * also increment the source account's sequence number by 1.
    * @returns {Transaction} will return the built Transaction.
    */
    build() {
        var attrs = {
          sourceAccount: Keypair.fromAddress(this.source.address).publicKey(),
          fee:           this.fee,
          seqNum:        xdr.SequenceNumber.fromString(String(Number(this.source.sequence) + 1)),
          memo:          this.memo
        };
        if (this.timebounds) {
            attrs.timeBounds = new xdr.TimeBounds(this.timebounds);
        }
        let tx = new xdr.Transaction(attrs);

        this.source.sequence = this.source.sequence + 1;

        tx.operations(this.operations);

        let tx_raw = tx.toXDR();

        let tx_hash    = hash(tx_raw);
        let signatures = [];
        for (var i = 0; i < this.signers.length; i++) {
            signatures.push(this.signers[i].signDecorated(tx_hash));
        }
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        return new Transaction(envelope);
    }
}
