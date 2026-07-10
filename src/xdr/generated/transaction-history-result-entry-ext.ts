/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type TransactionHistoryResultEntryExtWire = { v: 0 };

export type TransactionHistoryResultEntryExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class TransactionHistoryResultEntryExtBase extends XdrValue {
  abstract readonly type: TransactionHistoryResultEntryExtVariantName;

  static readonly schema: XdrType<TransactionHistoryResultEntryExtWire> = union(
    "TransactionHistoryResultEntryExt",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): TransactionHistoryResultEntryExtV0 {
    return new TransactionHistoryResultEntryExtV0();
  }

  static fromXdrObject(
    wire: TransactionHistoryResultEntryExtWire,
  ): TransactionHistoryResultEntryExt {
    switch (wire.v) {
      case 0:
        return new TransactionHistoryResultEntryExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionHistoryResultEntryExt variant.
   * Use this instead of `instanceof TransactionHistoryResultEntryExt`: the exported `TransactionHistoryResultEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionHistoryResultEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionHistoryResultEntryExt {
    return value instanceof TransactionHistoryResultEntryExtBase;
  }

  abstract toXdrObject(): TransactionHistoryResultEntryExtWire;
}

export class TransactionHistoryResultEntryExtV0 extends TransactionHistoryResultEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionHistoryResultEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type TransactionHistoryResultEntryExt =
  TransactionHistoryResultEntryExtV0;
export const TransactionHistoryResultEntryExt =
  TransactionHistoryResultEntryExtBase;
