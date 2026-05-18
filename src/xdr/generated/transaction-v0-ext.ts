/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type TransactionV0ExtWire = { v: 0 };

export type TransactionV0ExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class TransactionV0ExtBase extends XdrValue {
  abstract readonly type: TransactionV0ExtVariantName;

  static readonly schema: XdrType<TransactionV0ExtWire> = union(
    "TransactionV0Ext",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): TransactionV0ExtV0 {
    return new TransactionV0ExtV0();
  }

  static fromXdrObject(wire: TransactionV0ExtWire): TransactionV0Ext {
    switch (wire.v) {
      case 0:
        return new TransactionV0ExtV0();
    }
  }

  abstract toXdrObject(): TransactionV0ExtWire;
}

export class TransactionV0ExtV0 extends TransactionV0ExtBase {
  readonly type = "v0" as const;

  toXdrObject(): Extract<TransactionV0ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type TransactionV0Ext = TransactionV0ExtV0;
export const TransactionV0Ext = TransactionV0ExtBase;
