/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type LedgerHeaderExtensionV1ExtWire = { v: 0 };

export type LedgerHeaderExtensionV1ExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class LedgerHeaderExtensionV1ExtBase extends XdrValue {
  abstract readonly type: LedgerHeaderExtensionV1ExtVariantName;

  static readonly schema: XdrType<LedgerHeaderExtensionV1ExtWire> = union(
    "LedgerHeaderExtensionV1Ext",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): LedgerHeaderExtensionV1ExtV0 {
    return new LedgerHeaderExtensionV1ExtV0();
  }

  static fromXdrObject(
    wire: LedgerHeaderExtensionV1ExtWire,
  ): LedgerHeaderExtensionV1Ext {
    switch (wire.v) {
      case 0:
        return new LedgerHeaderExtensionV1ExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerHeaderExtensionV1Ext variant.
   * Use this instead of `instanceof LedgerHeaderExtensionV1Ext`: the exported `LedgerHeaderExtensionV1Ext` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerHeaderExtensionV1Ext.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerHeaderExtensionV1Ext {
    return value instanceof LedgerHeaderExtensionV1ExtBase;
  }

  abstract toXdrObject(): LedgerHeaderExtensionV1ExtWire;
}

export class LedgerHeaderExtensionV1ExtV0 extends LedgerHeaderExtensionV1ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LedgerHeaderExtensionV1ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type LedgerHeaderExtensionV1Ext = LedgerHeaderExtensionV1ExtV0;
export const LedgerHeaderExtensionV1Ext = LedgerHeaderExtensionV1ExtBase;
