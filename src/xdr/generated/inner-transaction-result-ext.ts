/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type InnerTransactionResultExtWire = { v: 0 };

export type InnerTransactionResultExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class InnerTransactionResultExtBase extends XdrValue {
  abstract readonly type: InnerTransactionResultExtVariantName;

  static readonly schema: XdrType<InnerTransactionResultExtWire> = union(
    "InnerTransactionResultExt",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): InnerTransactionResultExtV0 {
    return new InnerTransactionResultExtV0();
  }

  static fromXdrObject(
    wire: InnerTransactionResultExtWire,
  ): InnerTransactionResultExt {
    switch (wire.v) {
      case 0:
        return new InnerTransactionResultExtV0();
    }
  }

  abstract toXdrObject(): InnerTransactionResultExtWire;
}

export class InnerTransactionResultExtV0 extends InnerTransactionResultExtBase {
  readonly type = "v0" as const;

  toXdrObject(): Extract<InnerTransactionResultExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type InnerTransactionResultExt = InnerTransactionResultExtV0;
export const InnerTransactionResultExt = InnerTransactionResultExtBase;
