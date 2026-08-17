/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { EnvelopeType } from "./envelope-type.js";
import { Transaction, type TransactionWire } from "./transaction.js";
import {
  FeeBumpTransaction,
  type FeeBumpTransactionWire,
} from "./fee-bump-transaction.js";

export type TransactionSignaturePayloadTaggedTransactionWire =
  | { type: 2; tx: TransactionWire }
  | { type: 5; feeBump: FeeBumpTransactionWire };

export type TransactionSignaturePayloadTaggedTransactionVariantName =
  | "envelopeTypeTx"
  | "envelopeTypeTxFeeBump";

/**
 * ```xdr
 * union switch (EnvelopeType type)
 *     {
 *     // Backwards Compatibility: Use ENVELOPE_TYPE_TX to sign ENVELOPE_TYPE_TX_V0
 *     case ENVELOPE_TYPE_TX:
 *         Transaction tx;
 *     case ENVELOPE_TYPE_TX_FEE_BUMP:
 *         FeeBumpTransaction feeBump;
 *     }
 * ```
 */
abstract class TransactionSignaturePayloadTaggedTransactionBase extends XdrValue {
  abstract readonly type: TransactionSignaturePayloadTaggedTransactionVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === TransactionSignaturePayloadTaggedTransactionBase) {
      throw new TypeError(
        "new xdr.TransactionSignaturePayloadTaggedTransaction(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(...) " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<TransactionSignaturePayloadTaggedTransactionWire> =
    union("TransactionSignaturePayloadTaggedTransaction", {
      switchOn: EnvelopeType.schema,
      cases: [
        case_("envelopeTypeTx", 2, field("tx", Transaction.schema)),
        case_(
          "envelopeTypeTxFeeBump",
          5,
          field("feeBump", FeeBumpTransaction.schema),
        ),
      ],
    });

  static envelopeTypeTx(
    tx: Transaction,
  ): TransactionSignaturePayloadTaggedTransactionTx {
    return new TransactionSignaturePayloadTaggedTransactionTx(tx);
  }

  static envelopeTypeTxFeeBump(
    feeBump: FeeBumpTransaction,
  ): TransactionSignaturePayloadTaggedTransactionTxFeeBump {
    return new TransactionSignaturePayloadTaggedTransactionTxFeeBump(feeBump);
  }

  static fromXdrObject(
    wire: TransactionSignaturePayloadTaggedTransactionWire,
  ): TransactionSignaturePayloadTaggedTransaction {
    switch (wire.type) {
      case 2:
        return new TransactionSignaturePayloadTaggedTransactionTx(
          Transaction.fromXdrObject(wire.tx),
        );
      case 5:
        return new TransactionSignaturePayloadTaggedTransactionTxFeeBump(
          FeeBumpTransaction.fromXdrObject(wire.feeBump),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `TransactionSignaturePayloadTaggedTransaction: unknown type ${(wire as { type: unknown }).type}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionSignaturePayloadTaggedTransaction variant.
   * Use this instead of `instanceof TransactionSignaturePayloadTaggedTransaction`: the exported `TransactionSignaturePayloadTaggedTransaction` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionSignaturePayloadTaggedTransaction.is(x)` narrows to the union.
   */
  static is(
    value: unknown,
  ): value is TransactionSignaturePayloadTaggedTransaction {
    return value instanceof TransactionSignaturePayloadTaggedTransactionBase;
  }

  abstract toXdrObject(): TransactionSignaturePayloadTaggedTransactionWire;
}

export class TransactionSignaturePayloadTaggedTransactionTx extends TransactionSignaturePayloadTaggedTransactionBase {
  readonly type = "envelopeTypeTx" as const;
  readonly tx: Transaction;

  constructor(tx: Transaction) {
    super();
    this.tx = tx;
  }

  get value(): Transaction {
    return this.tx;
  }

  toXdrObject(): Extract<
    TransactionSignaturePayloadTaggedTransactionWire,
    { type: 2 }
  > {
    return { type: 2, tx: this.tx.toXdrObject() };
  }
}

export class TransactionSignaturePayloadTaggedTransactionTxFeeBump extends TransactionSignaturePayloadTaggedTransactionBase {
  readonly type = "envelopeTypeTxFeeBump" as const;
  readonly feeBump: FeeBumpTransaction;

  constructor(feeBump: FeeBumpTransaction) {
    super();
    this.feeBump = feeBump;
  }

  get value(): FeeBumpTransaction {
    return this.feeBump;
  }

  toXdrObject(): Extract<
    TransactionSignaturePayloadTaggedTransactionWire,
    { type: 5 }
  > {
    return { type: 5, feeBump: this.feeBump.toXdrObject() };
  }
}

export type TransactionSignaturePayloadTaggedTransaction =
  | TransactionSignaturePayloadTaggedTransactionTx
  | TransactionSignaturePayloadTaggedTransactionTxFeeBump;
export const TransactionSignaturePayloadTaggedTransaction =
  TransactionSignaturePayloadTaggedTransactionBase;
