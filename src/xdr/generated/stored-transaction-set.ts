/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { TransactionSet, type TransactionSetWire } from "./transaction-set.js";
import {
  GeneralizedTransactionSet,
  type GeneralizedTransactionSetWire,
} from "./generalized-transaction-set.js";

export type StoredTransactionSetWire =
  | { v: 0; txSet: TransactionSetWire }
  | { v: 1; generalizedTxSet: GeneralizedTransactionSetWire };

export type StoredTransactionSetVariantName = "txSet" | "generalizedTxSet";

/**
 * ```xdr
 * union StoredTransactionSet switch (int v)
 * {
 * case 0:
 * 	TransactionSet txSet;
 * case 1:
 * 	GeneralizedTransactionSet generalizedTxSet;
 * };
 * ```
 */
abstract class StoredTransactionSetBase extends XdrValue {
  abstract readonly type: StoredTransactionSetVariantName;

  static readonly schema: XdrType<StoredTransactionSetWire> = union(
    "StoredTransactionSet",
    {
      switchOn: int32(),
      cases: [
        case_("txSet", 0, field("txSet", TransactionSet.schema)),
        case_(
          "generalizedTxSet",
          1,
          field("generalizedTxSet", GeneralizedTransactionSet.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static txSet(txSet: TransactionSet): StoredTransactionSetTxSet {
    return new StoredTransactionSetTxSet(txSet);
  }

  static generalizedTxSet(
    generalizedTxSet: GeneralizedTransactionSet,
  ): StoredTransactionSetGeneralizedTxset {
    return new StoredTransactionSetGeneralizedTxset(generalizedTxSet);
  }

  static fromXdrObject(wire: StoredTransactionSetWire): StoredTransactionSet {
    switch (wire.v) {
      case 0:
        return new StoredTransactionSetTxSet(
          TransactionSet.fromXdrObject(wire.txSet),
        );
      case 1:
        return new StoredTransactionSetGeneralizedTxset(
          GeneralizedTransactionSet.fromXdrObject(wire.generalizedTxSet),
        );
    }
  }

  abstract toXdrObject(): StoredTransactionSetWire;
}

export class StoredTransactionSetTxSet extends StoredTransactionSetBase {
  readonly type = "txSet" as const;
  readonly txSet: TransactionSet;

  constructor(txSet: TransactionSet) {
    super();
    this.txSet = txSet;
  }

  get value(): TransactionSet {
    return this.txSet;
  }

  toXdrObject(): Extract<StoredTransactionSetWire, { v: 0 }> {
    return { v: 0, txSet: this.txSet.toXdrObject() };
  }
}

export class StoredTransactionSetGeneralizedTxset extends StoredTransactionSetBase {
  readonly type = "generalizedTxSet" as const;
  readonly generalizedTxSet: GeneralizedTransactionSet;

  constructor(generalizedTxSet: GeneralizedTransactionSet) {
    super();
    this.generalizedTxSet = generalizedTxSet;
  }

  get value(): GeneralizedTransactionSet {
    return this.generalizedTxSet;
  }

  toXdrObject(): Extract<StoredTransactionSetWire, { v: 1 }> {
    return { v: 1, generalizedTxSet: this.generalizedTxSet.toXdrObject() };
  }
}

export type StoredTransactionSet =
  | StoredTransactionSetTxSet
  | StoredTransactionSetGeneralizedTxset;
export const StoredTransactionSet = StoredTransactionSetBase;
