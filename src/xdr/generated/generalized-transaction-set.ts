/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, int32, union } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionSetV1,
  type TransactionSetV1Wire,
} from "./transaction-set-v1.js";

export type GeneralizedTransactionSetWire = {
  v: 1;
  v1TxSet: TransactionSetV1Wire;
};

export type GeneralizedTransactionSetVariantName = "v1TxSet";

/**
 * ```xdr
 * union GeneralizedTransactionSet switch (int v)
 * {
 * // We consider the legacy TransactionSet to be v0.
 * case 1:
 *     TransactionSetV1 v1TxSet;
 * };
 * ```
 */
abstract class GeneralizedTransactionSetBase extends XdrValue {
  abstract readonly type: GeneralizedTransactionSetVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === GeneralizedTransactionSetBase) {
      throw new TypeError(
        "new xdr.GeneralizedTransactionSet(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.GeneralizedTransactionSet.v1TxSet(...) " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<GeneralizedTransactionSetWire> = union(
    "GeneralizedTransactionSet",
    {
      switchOn: int32(),
      cases: [case_("v1TxSet", 1, field("v1TxSet", TransactionSetV1.schema))],
      switchKey: "v",
    },
  );

  static v1TxSet(v1TxSet: TransactionSetV1): GeneralizedTransactionSetV1TxSet {
    return new GeneralizedTransactionSetV1TxSet(v1TxSet);
  }

  static fromXdrObject(
    wire: GeneralizedTransactionSetWire,
  ): GeneralizedTransactionSet {
    switch (wire.v) {
      case 1:
        return new GeneralizedTransactionSetV1TxSet(
          TransactionSetV1.fromXdrObject(wire.v1TxSet),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `GeneralizedTransactionSet: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete GeneralizedTransactionSet variant.
   * Use this instead of `instanceof GeneralizedTransactionSet`: the exported `GeneralizedTransactionSet` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `GeneralizedTransactionSet.is(x)` narrows to the union.
   */
  static is(value: unknown): value is GeneralizedTransactionSet {
    return value instanceof GeneralizedTransactionSetBase;
  }

  abstract toXdrObject(): GeneralizedTransactionSetWire;
}

export class GeneralizedTransactionSetV1TxSet extends GeneralizedTransactionSetBase {
  readonly type = "v1TxSet" as const;
  readonly v1TxSet: TransactionSetV1;

  constructor(v1TxSet: TransactionSetV1) {
    super();
    this.v1TxSet = v1TxSet;
  }

  get value(): TransactionSetV1 {
    return this.v1TxSet;
  }

  toXdrObject(): Extract<GeneralizedTransactionSetWire, { v: 1 }> {
    return { v: 1, v1TxSet: this.v1TxSet.toXdrObject() };
  }
}

export type GeneralizedTransactionSet = GeneralizedTransactionSetV1TxSet;
export const GeneralizedTransactionSet = GeneralizedTransactionSetBase;
