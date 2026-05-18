/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
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

  static readonly schema: XdrType<GeneralizedTransactionSetWire> = union(
    "GeneralizedTransactionSet",
    {
      switchOn: int32(),
      cases: [case_("v1TxSet", 1, field("v1TxSet", TransactionSetV1.schema))],
      switchKey: "v",
    },
  );

  static v1TxSet(v1TxSet: TransactionSetV1): GeneralizedTransactionSetV1txset {
    return new GeneralizedTransactionSetV1txset(v1TxSet);
  }

  static fromXdrObject(
    wire: GeneralizedTransactionSetWire,
  ): GeneralizedTransactionSet {
    switch (wire.v) {
      case 1:
        return new GeneralizedTransactionSetV1txset(
          TransactionSetV1.fromXdrObject(wire.v1TxSet),
        );
    }
  }

  abstract toXdrObject(): GeneralizedTransactionSetWire;
}

export class GeneralizedTransactionSetV1txset extends GeneralizedTransactionSetBase {
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

export type GeneralizedTransactionSet = GeneralizedTransactionSetV1txset;
export const GeneralizedTransactionSet = GeneralizedTransactionSetBase;
