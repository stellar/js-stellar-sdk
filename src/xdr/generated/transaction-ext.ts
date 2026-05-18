/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanTransactionData,
  type SorobanTransactionDataWire,
} from "./soroban-transaction-data.js";

export type TransactionExtWire =
  | { v: 0 }
  | { v: 1; sorobanData: SorobanTransactionDataWire };

export type TransactionExtVariantName = "v0" | "sorobanData";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         SorobanTransactionData sorobanData;
 *     }
 * ```
 */
abstract class TransactionExtBase extends XdrValue {
  abstract readonly type: TransactionExtVariantName;

  static readonly schema: XdrType<TransactionExtWire> = union(
    "TransactionExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_(
          "sorobanData",
          1,
          field("sorobanData", SorobanTransactionData.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static v0(): TransactionExtV0 {
    return new TransactionExtV0();
  }

  static sorobanData(
    sorobanData: SorobanTransactionData,
  ): TransactionExtSorobanData {
    return new TransactionExtSorobanData(sorobanData);
  }

  static fromXdrObject(wire: TransactionExtWire): TransactionExt {
    switch (wire.v) {
      case 0:
        return new TransactionExtV0();
      case 1:
        return new TransactionExtSorobanData(
          SorobanTransactionData.fromXdrObject(wire.sorobanData),
        );
    }
  }

  abstract toXdrObject(): TransactionExtWire;
}

export class TransactionExtV0 extends TransactionExtBase {
  readonly type = "v0" as const;

  toXdrObject(): Extract<TransactionExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class TransactionExtSorobanData extends TransactionExtBase {
  readonly type = "sorobanData" as const;
  readonly sorobanData: SorobanTransactionData;

  constructor(sorobanData: SorobanTransactionData) {
    super();
    this.sorobanData = sorobanData;
  }

  get value(): SorobanTransactionData {
    return this.sorobanData;
  }

  toXdrObject(): Extract<TransactionExtWire, { v: 1 }> {
    return { v: 1, sorobanData: this.sorobanData.toXdrObject() };
  }
}

export type TransactionExt = TransactionExtV0 | TransactionExtSorobanData;
export const TransactionExt = TransactionExtBase;
