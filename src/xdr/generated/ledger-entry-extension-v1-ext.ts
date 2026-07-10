/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type LedgerEntryExtensionV1ExtWire = { v: 0 };

export type LedgerEntryExtensionV1ExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class LedgerEntryExtensionV1ExtBase extends XdrValue {
  abstract readonly type: LedgerEntryExtensionV1ExtVariantName;

  static readonly schema: XdrType<LedgerEntryExtensionV1ExtWire> = union(
    "LedgerEntryExtensionV1Ext",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): LedgerEntryExtensionV1ExtV0 {
    return new LedgerEntryExtensionV1ExtV0();
  }

  static fromXdrObject(
    wire: LedgerEntryExtensionV1ExtWire,
  ): LedgerEntryExtensionV1Ext {
    switch (wire.v) {
      case 0:
        return new LedgerEntryExtensionV1ExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerEntryExtensionV1Ext variant.
   * Use this instead of `instanceof LedgerEntryExtensionV1Ext`: the exported `LedgerEntryExtensionV1Ext` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerEntryExtensionV1Ext.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerEntryExtensionV1Ext {
    return value instanceof LedgerEntryExtensionV1ExtBase;
  }

  abstract toXdrObject(): LedgerEntryExtensionV1ExtWire;
}

export class LedgerEntryExtensionV1ExtV0 extends LedgerEntryExtensionV1ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LedgerEntryExtensionV1ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type LedgerEntryExtensionV1Ext = LedgerEntryExtensionV1ExtV0;
export const LedgerEntryExtensionV1Ext = LedgerEntryExtensionV1ExtBase;
