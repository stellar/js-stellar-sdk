/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type TransactionResultExtWire = { v: 0 };

export type TransactionResultExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class TransactionResultExtBase extends XdrValue {
  abstract readonly type: TransactionResultExtVariantName;

  static readonly schema: XdrType<TransactionResultExtWire> = union(
    "TransactionResultExt",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): TransactionResultExtV0 {
    return new TransactionResultExtV0();
  }

  static fromXdrObject(wire: TransactionResultExtWire): TransactionResultExt {
    switch (wire.v) {
      case 0:
        return new TransactionResultExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionResultExt variant.
   * Use this instead of `instanceof TransactionResultExt`: the exported `TransactionResultExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionResultExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionResultExt {
    return value instanceof TransactionResultExtBase;
  }

  abstract toXdrObject(): TransactionResultExtWire;
}

export class TransactionResultExtV0 extends TransactionResultExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type TransactionResultExt = TransactionResultExtV0;
export const TransactionResultExt = TransactionResultExtBase;
