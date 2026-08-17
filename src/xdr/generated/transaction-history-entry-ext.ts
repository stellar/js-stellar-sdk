/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import {
  case as case_,
  field,
  int32,
  union,
  void as voidType,
} from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  GeneralizedTransactionSet,
  type GeneralizedTransactionSetWire,
} from "./generalized-transaction-set.js";

export type TransactionHistoryEntryExtWire =
  | { v: 0 }
  | { v: 1; generalizedTxSet: GeneralizedTransactionSetWire };

export type TransactionHistoryEntryExtVariantName = "v0" | "generalizedTxSet";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         GeneralizedTransactionSet generalizedTxSet;
 *     }
 * ```
 */
abstract class TransactionHistoryEntryExtBase extends XdrValue {
  abstract readonly type: TransactionHistoryEntryExtVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === TransactionHistoryEntryExtBase) {
      throw new TypeError(
        "new xdr.TransactionHistoryEntryExt(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.TransactionHistoryEntryExt.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<TransactionHistoryEntryExtWire> = union(
    "TransactionHistoryEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_(
          "generalizedTxSet",
          1,
          field("generalizedTxSet", GeneralizedTransactionSet.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static v0(): TransactionHistoryEntryExtV0 {
    return new TransactionHistoryEntryExtV0();
  }

  static generalizedTxSet(
    generalizedTxSet: GeneralizedTransactionSet,
  ): TransactionHistoryEntryExtGeneralizedTxSet {
    return new TransactionHistoryEntryExtGeneralizedTxSet(generalizedTxSet);
  }

  static fromXdrObject(
    wire: TransactionHistoryEntryExtWire,
  ): TransactionHistoryEntryExt {
    switch (wire.v) {
      case 0:
        return new TransactionHistoryEntryExtV0();
      case 1:
        return new TransactionHistoryEntryExtGeneralizedTxSet(
          GeneralizedTransactionSet.fromXdrObject(wire.generalizedTxSet),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `TransactionHistoryEntryExt: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionHistoryEntryExt variant.
   * Use this instead of `instanceof TransactionHistoryEntryExt`: the exported `TransactionHistoryEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionHistoryEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionHistoryEntryExt {
    return value instanceof TransactionHistoryEntryExtBase;
  }

  abstract toXdrObject(): TransactionHistoryEntryExtWire;
}

export class TransactionHistoryEntryExtV0 extends TransactionHistoryEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionHistoryEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class TransactionHistoryEntryExtGeneralizedTxSet extends TransactionHistoryEntryExtBase {
  readonly type = "generalizedTxSet" as const;
  readonly generalizedTxSet: GeneralizedTransactionSet;

  constructor(generalizedTxSet: GeneralizedTransactionSet) {
    super();
    this.generalizedTxSet = generalizedTxSet;
  }

  get value(): GeneralizedTransactionSet {
    return this.generalizedTxSet;
  }

  toXdrObject(): Extract<TransactionHistoryEntryExtWire, { v: 1 }> {
    return { v: 1, generalizedTxSet: this.generalizedTxSet.toXdrObject() };
  }
}

export type TransactionHistoryEntryExt =
  | TransactionHistoryEntryExtV0
  | TransactionHistoryEntryExtGeneralizedTxSet;
export const TransactionHistoryEntryExt = TransactionHistoryEntryExtBase;
