import {xdr, hash} from "stellar-base";

import {Operation} from "./operation";
import {Transaction} from "./transaction";
import {Memo} from "./memo";

let MAX_FEE      = 1000;
let MIN_LEDGER   = 0;
let MAX_LEDGER   = 0xFFFFFFFF; // max uint32

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
    * @param {number} [opts.maxFee] - The max fee willing to pay for this transaction.
    * @param {number} [opts.minLedger] - The minimum ledger this transaction is valid in.
    * @param {number} [opts.maxLedger] - The maximum ledger this transaction is valid in.
    * @param {Memo} [opts.memo] - The memo for the transaction
    * @param {}
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

        this.memo       = opts.memo || Memo.none();

        // the signed hex form of the transaction to be sent to Horizon
        this.blob = null;
    }

    /**
    * Adds an operation to the transaction.
    * @param {xdr.Operation} The xdr operation object, use {@link Operation} static methods.
    */
    addOperation(operation) {
        this._operations.push(operation);
        return this;
    }

    /**
    * This will build the transaction and sign it with the source account. It will
    * also increment the source account's sequence number by 1.
    * @returns {Transaction} will return the built Transaction.
    */
    build() {
        let tx = new xdr.Transaction({
          sourceAccount: this._source.masterKeypair.publicKey(),
          maxFee:        this.maxFee,
          seqNum:        xdr.SequenceNumber.fromString(String(this._source.sequence)),
          minLedger:     this.minLedger,
          maxLedger:     this.maxLedger,
          memo:          this.memo
        });

        this._source.sequence = this._source.sequence + 1;

        tx.operations(this._operations);

        let tx_raw = tx.toXDR();

        let tx_hash    = hash(tx_raw);
        let signatures = [this._source.masterKeypair.signDecorated(tx_hash)];
        let envelope = new xdr.TransactionEnvelope({tx, signatures});

        return new Transaction(envelope);
    }
}
