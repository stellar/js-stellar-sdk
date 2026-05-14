import {
  ClaimableBalanceId,
  EnvelopeType,
  HashIdPreimage,
  Memo as XdrMemo,
  PreconditionType,
  PublicKey,
  SignerKey,
  Transaction as XdrTransaction,
  TransactionEnvelope,
  TransactionSignaturePayload,
  TransactionSignaturePayloadTaggedTransaction,
  TransactionV0,
} from "./generated/index.js";
import { hash } from "./hashing.js";

import { StrKey } from "./strkey.js";
import { Operation } from "./operation.js";
import { Memo } from "./memo.js";
import { TransactionBase } from "./transaction_base.js";
import {
  extractBaseAddress,
  encodeMuxedAccountToAddress,
} from "./util/decode_encode_muxed_account.js";
import { OperationRecord } from "./operations/types.js";

/**
 * Use {@link TransactionBuilder} to build a transaction object. If you have an
 * object or base64-encoded string of the transaction envelope XDR, use {@link
 * TransactionBuilder.fromXDR}.
 *
 * Once a Transaction has been created, its attributes and operations should not
 * be changed. You should only add signatures (using {@link Transaction#sign})
 * to a Transaction object before submitting to the network or forwarding on to
 * additional signers.
 *
 */
export class Transaction extends TransactionBase<
  XdrTransaction | TransactionV0
> {
  private _envelopeType: EnvelopeType;
  private _source: string = "";
  private _memo: XdrMemo;
  private _sequence: string;
  private _operations: OperationRecord[];
  private _timeBounds?: { minTime: string; maxTime: string };
  private _ledgerBounds?: { minLedger: number; maxLedger: number };
  private _minAccountSequence?: string;
  private _minAccountSequenceAge?: bigint;
  private _minAccountSequenceLedgerGap?: number;
  private _extraSigners?: SignerKey[];

  /**
   * @param envelope - transaction envelope object or base64 encoded string
   * @param networkPassphrase - passphrase of the target stellar network
   *     (e.g. "Public Global Stellar Network ; September 2015")
   */
  constructor(
    envelope: TransactionEnvelope | string,
    networkPassphrase: string,
  ) {
    if (typeof envelope === "string") {
      const buffer = Buffer.from(envelope, "base64");
      envelope = TransactionEnvelope.fromXDR(buffer);
    }

    const envelopeType = envelope.type;
    if (
      !(
        envelopeType === EnvelopeType.envelopeTypeTxV0 ||
        envelopeType === EnvelopeType.envelopeTypeTx
      )
    ) {
      throw new Error(
        `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${envelopeType}.`,
      );
    }

    const txEnvelope =
      envelope.type === "envelopeTypeTxV0" ? envelope.v0 : envelope.v1;
    const tx = txEnvelope.tx;
    const fee = tx.fee.toString();
    const signatures = (txEnvelope.signatures || []).slice();

    super(tx, signatures, fee, networkPassphrase);

    this._envelopeType = envelopeType;
    this._memo = tx.memo;
    this._sequence = tx.seqNum.toString();

    switch (this._envelopeType) {
      case EnvelopeType.envelopeTypeTxV0:
        this._source = StrKey.encodeEd25519PublicKey(
          Buffer.from((tx as TransactionV0).sourceAccountEd25519),
        );
        break;
      default:
        this._source = encodeMuxedAccountToAddress(
          (tx as XdrTransaction).sourceAccount,
        );
        break;
    }

    let cond = null;
    let timeBounds = null;
    switch (this._envelopeType) {
      case EnvelopeType.envelopeTypeTxV0:
        timeBounds = (tx as TransactionV0).timeBounds;
        break;

      case EnvelopeType.envelopeTypeTx: {
        const preconditions = (tx as XdrTransaction).cond;
        switch (preconditions.type) {
          case PreconditionType.precondTime:
            timeBounds = preconditions.timeBounds;
            break;

          case PreconditionType.precondV2:
            cond = preconditions.v2;
            timeBounds = cond.timeBounds;
            break;

          default:
            break;
        }
        break;
      }

      default:
        break;
    }

    if (timeBounds) {
      this._timeBounds = {
        minTime: timeBounds.minTime.toString(),
        maxTime: timeBounds.maxTime.toString(),
      };
    }

    if (cond) {
      const ledgerBounds = cond.ledgerBounds;
      if (ledgerBounds) {
        this._ledgerBounds = {
          minLedger: ledgerBounds.minLedger,
          maxLedger: ledgerBounds.maxLedger,
        };
      }

      const minSeq = cond.minSeqNum;
      if (minSeq) {
        this._minAccountSequence = minSeq.toString();
      }

      this._minAccountSequenceAge = cond.minSeqAge;
      this._minAccountSequenceLedgerGap = cond.minSeqLedgerGap;
      this._extraSigners = cond.extraSigners.slice();
    }

    const operations = tx.operations || [];
    this._operations = operations.map((op) => Operation.fromXDRObject(op));
  }

  /**
   * The time bounds for this transaction, with `minTime` and `maxTime` as
   * 64-bit unix timestamps (strings).
   */
  get timeBounds() {
    return this._timeBounds;
  }
  set timeBounds(_value) {
    throw new Error("Transaction is immutable");
  }

  /**
   * The ledger bounds for this transaction, with `minLedger` (uint32) and
   * `maxLedger` (uint32, or 0 for no upper bound).
   */
  get ledgerBounds() {
    return this._ledgerBounds;
  }
  set ledgerBounds(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The minimum account sequence (64-bit, as a string). */
  get minAccountSequence() {
    return this._minAccountSequence;
  }
  set minAccountSequence(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The minimum account sequence age (64-bit number of seconds). */
  get minAccountSequenceAge() {
    return this._minAccountSequenceAge;
  }
  set minAccountSequenceAge(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The minimum account sequence ledger gap (32-bit number of ledgers). */
  get minAccountSequenceLedgerGap() {
    return this._minAccountSequenceLedgerGap;
  }
  set minAccountSequenceLedgerGap(_value) {
    throw new Error("Transaction is immutable");
  }

  /**
   * Array of extra signers as XDR objects; use {@link SignerKey.encodeSignerKey}
   * to convert to StrKey strings.
   */
  get extraSigners() {
    return this._extraSigners;
  }
  set extraSigners(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The sequence number for this transaction. */
  get sequence() {
    return this._sequence;
  }
  set sequence(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The source account for this transaction. */
  get source() {
    return this._source;
  }
  set source(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The list of operations in this transaction. */
  get operations() {
    return this._operations;
  }
  set operations(_value) {
    throw new Error("Transaction is immutable");
  }

  /** The memo attached to this transaction. */
  get memo() {
    return Memo.fromXDRObject(this._memo);
  }
  set memo(_value) {
    throw new Error("Transaction is immutable");
  }

  /**
   * Returns the "signature base" of this transaction, which is the value
   * that, when hashed, should be signed to create a signature that
   * validators on the Stellar Network will accept.
   *
   * It is composed of a 4 prefix bytes followed by the xdr-encoded form
   * of this transaction.
   */
  override signatureBase(): Buffer {
    let tx = this.tx;

    // Backwards Compatibility: Use ENVELOPE_TYPE_TX to sign ENVELOPE_TYPE_TX_V0
    // we need a Transaction to generate the signature base
    if (this._envelopeType === EnvelopeType.envelopeTypeTxV0) {
      tx = XdrTransaction.fromXDR(
        Buffer.concat([
          // TransactionV0 is a transaction with the AccountID discriminant
          // stripped off, we need to put it back to build a valid transaction
          // which we can use to build a TransactionSignaturePayloadTaggedTransaction
          Buffer.alloc(4), // AccountID discriminant: publicKeyTypeEd25519 = 0
          TransactionV0.toXDR(tx as TransactionV0, "raw"),
        ]),
      );
    }

    const taggedTransaction =
      TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(
        tx as XdrTransaction,
      );

    const txSignature = {
      networkId: hash(this.networkPassphrase),
      taggedTransaction,
    };

    return Buffer.from(TransactionSignaturePayload.toXDR(txSignature, "raw"));
  }

  /**
   * To envelope returns a TransactionEnvelope which can be submitted to the network.
   */
  override toEnvelope(): TransactionEnvelope {
    const currentTx = this.tx;
    const signatures = this.signatures.slice(); // make a copy of the signatures

    let envelope;
    switch (this._envelopeType) {
      case EnvelopeType.envelopeTypeTxV0:
        envelope = TransactionEnvelope.envelopeTypeTxV0({
          tx: TransactionV0.fromXDR(
            TransactionV0.toXDR(currentTx as TransactionV0, "raw"),
          ), // make a copy of tx
          signatures,
        });
        break;
      case EnvelopeType.envelopeTypeTx:
        envelope = TransactionEnvelope.envelopeTypeTx({
          tx: XdrTransaction.fromXDR(
            XdrTransaction.toXDR(currentTx as XdrTransaction, "raw"),
          ), // make a copy of tx
          signatures,
        });
        break;
      default:
        throw new Error(
          `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${this._envelopeType}.`,
        );
    }

    return envelope;
  }

  /**
   * Calculate the claimable balance ID for an operation within the transaction.
   *
   * @param opIndex - the index of the CreateClaimableBalance op
   *
   * @throws {Error} for invalid `opIndex` value, if op at `opIndex` is not
   *    `CreateClaimableBalance`, or for general XDR un/marshalling failures
   *
   * @see https://github.com/stellar/go/blob/d712346e61e288d450b0c08038c158f8848cc3e4/txnbuild/transaction.go#L392-L435
   *
   */
  getClaimableBalanceId(opIndex: number): string {
    // Validate and then extract the operation from the transaction.
    if (
      !Number.isInteger(opIndex) ||
      opIndex < 0 ||
      opIndex >= this.operations.length
    ) {
      throw new RangeError("invalid operation index");
    }

    const op = this.operations[opIndex];

    if (op === undefined) {
      throw new RangeError("invalid operation index");
    }

    try {
      Operation.createClaimableBalance(
        op as Parameters<typeof Operation.createClaimableBalance>[0],
      );
    } catch (err) {
      throw new TypeError(
        `expected createClaimableBalance, got ${op.type}: ${String(err)}`,
      );
    }

    // Always use the transaction's *unmuxed* source.
    const account = StrKey.decodeEd25519PublicKey(
      extractBaseAddress(this.source),
    );
    const operationId = HashIdPreimage.envelopeTypeOpId({
      sourceAccount: PublicKey.publicKeyTypeEd25519(account),
      seqNum: BigInt(this.sequence),
      opNum: opIndex,
    });

    const opIdHash = hash(
      Buffer.from(HashIdPreimage.toXDR(operationId, "raw")),
    );
    const balanceId = ClaimableBalanceId.claimableBalanceIdTypeV0(opIdHash);
    return ClaimableBalanceId.toXDR(balanceId, "hex");
  }
}
