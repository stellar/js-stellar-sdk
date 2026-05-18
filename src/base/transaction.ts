import {
  ClaimableBalanceId,
  Hash,
  HashIdPreimage,
  HashIdPreimageOperationId,
  Int64,
  Memo as XdrMemo,
  Operation as XdrOperation,
  PublicKey,
  SignerKey,
  Transaction as XdrTransaction,
  TransactionEnvelope,
  TransactionSignaturePayload,
  TransactionSignaturePayloadTaggedTransaction,
  TransactionV0,
  TransactionV0Envelope,
  TransactionV1Envelope,
  PreconditionsV2,
  TimeBounds,
} from "../xdr/index.js";
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
 * TransactionBuilder.fromXdr}.
 *
 * Once a Transaction has been created, its attributes and operations should not
 * be changed. You should only add signatures (using {@link Transaction#sign})
 * to a Transaction object before submitting to the network or forwarding on to
 * additional signers.
 *
 */
type TxEnvelopeType = "envelopeTypeTxV0" | "envelopeTypeTx";

export class Transaction extends TransactionBase<
  XdrTransaction | TransactionV0
> {
  private _envelopeType: TxEnvelopeType;
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
      envelope = TransactionEnvelope.fromXdr(buffer);
    }

    const envelopeType = envelope.type;
    if (
      envelopeType !== "envelopeTypeTxV0" &&
      envelopeType !== "envelopeTypeTx"
    ) {
      throw new Error(
        `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${envelopeType}.`,
      );
    }

    const txEnvelope = envelope.value as
      | TransactionV0Envelope
      | TransactionV1Envelope;
    const tx = txEnvelope.tx;
    const fee = tx.fee.toString();
    const signatures = (txEnvelope.signatures || []).slice();

    super(tx, signatures, fee, networkPassphrase);

    this._envelopeType = envelopeType;
    this._memo = tx.memo;
    this._sequence = tx.seqNum.toString();

    switch (this._envelopeType) {
      case "envelopeTypeTxV0":
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

    let condV2: PreconditionsV2 | null = null;
    let timeBounds: TimeBounds | null = null;
    switch (this._envelopeType) {
      case "envelopeTypeTxV0":
        timeBounds = (tx as TransactionV0).timeBounds;
        break;

      case "envelopeTypeTx": {
        const cond = (tx as XdrTransaction).cond;
        switch (cond.type) {
          case "precondTime":
            timeBounds = cond.value;
            break;

          case "precondV2":
            condV2 = cond.value;
            timeBounds = condV2.timeBounds;
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

    if (condV2) {
      const ledgerBounds = condV2.ledgerBounds;
      if (ledgerBounds) {
        this._ledgerBounds = {
          minLedger: ledgerBounds.minLedger,
          maxLedger: ledgerBounds.maxLedger,
        };
      }

      const minSeq = condV2.minSeqNum;
      if (minSeq) {
        this._minAccountSequence = minSeq.toString();
      }

      this._minAccountSequenceAge = condV2.minSeqAge;
      this._minAccountSequenceLedgerGap = condV2.minSeqLedgerGap;
      this._extraSigners = condV2.extraSigners;
    }

    const operations = tx.operations || [];
    this._operations = operations.map((op: XdrOperation) =>
      Operation.fromXdrObject(op),
    );
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
    return Memo.fromXdrObject(this._memo);
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
    if (this._envelopeType === "envelopeTypeTxV0") {
      tx = XdrTransaction.fromXdr(
        Buffer.concat([
          // TransactionV0 is a transaction with the AccountID discriminant
          // stripped off, we need to put it back to build a valid transaction
          // which we can use to build a TransactionSignaturePayloadTaggedTransaction
          Buffer.alloc(4), // AccountID discriminant: publicKeyTypeEd25519 = 0
          tx.toXdr(),
        ]),
      );
    }

    const taggedTransaction =
      TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(
        tx as XdrTransaction,
      );

    const txSignature = new TransactionSignaturePayload({
      networkId: Hash.fromXdr(hash(this.networkPassphrase)),
      taggedTransaction,
    });

    return Buffer.from(txSignature.toXdr());
  }

  /**
   * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
   */
  override toEnvelope(): TransactionEnvelope {
    const rawTx = this.tx.toXdr();
    const signatures = this.signatures.slice(); // make a copy of the signatures

    let envelope;
    switch (this._envelopeType) {
      case "envelopeTypeTxV0":
        envelope = TransactionEnvelope.envelopeTypeTxV0(
          new TransactionV0Envelope({
            tx: TransactionV0.fromXdr(rawTx), // make a copy of tx
            signatures,
          }),
        );
        break;
      case "envelopeTypeTx":
        envelope = TransactionEnvelope.envelopeTypeTx(
          new TransactionV1Envelope({
            tx: XdrTransaction.fromXdr(rawTx), // make a copy of tx
            signatures,
          }),
        );
        break;
      default:
        throw new Error(
          `Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ${this._envelopeType as string}.`,
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
    const operationId = HashIdPreimage.envelopeTypeOpId(
      new HashIdPreimageOperationId({
        sourceAccount: PublicKey.publicKeyTypeEd25519(account),
        seqNum: Int64.fromString(this.sequence),
        opNum: opIndex,
      }),
    );

    const opIdHash = hash(Buffer.from(operationId.toXdr("raw")));
    const balanceId = ClaimableBalanceId.claimableBalanceIdTypeV0(
      new Hash(Uint8Array.from(opIdHash)),
    );
    return balanceId.toXdr("hex");
  }
}
