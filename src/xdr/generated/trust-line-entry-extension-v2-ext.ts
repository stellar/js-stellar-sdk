/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type TrustLineEntryExtensionV2ExtWire = { v: 0 };

export type TrustLineEntryExtensionV2ExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class TrustLineEntryExtensionV2ExtBase extends XdrValue {
  abstract readonly type: TrustLineEntryExtensionV2ExtVariantName;

  static readonly schema: XdrType<TrustLineEntryExtensionV2ExtWire> = union(
    "TrustLineEntryExtensionV2Ext",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): TrustLineEntryExtensionV2ExtV0 {
    return new TrustLineEntryExtensionV2ExtV0();
  }

  static fromXdrObject(
    wire: TrustLineEntryExtensionV2ExtWire,
  ): TrustLineEntryExtensionV2Ext {
    switch (wire.v) {
      case 0:
        return new TrustLineEntryExtensionV2ExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TrustLineEntryExtensionV2Ext variant.
   * Use this instead of `instanceof TrustLineEntryExtensionV2Ext`: the exported `TrustLineEntryExtensionV2Ext` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TrustLineEntryExtensionV2Ext.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TrustLineEntryExtensionV2Ext {
    return value instanceof TrustLineEntryExtensionV2ExtBase;
  }

  abstract toXdrObject(): TrustLineEntryExtensionV2ExtWire;
}

export class TrustLineEntryExtensionV2ExtV0 extends TrustLineEntryExtensionV2ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TrustLineEntryExtensionV2ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type TrustLineEntryExtensionV2Ext = TrustLineEntryExtensionV2ExtV0;
export const TrustLineEntryExtensionV2Ext = TrustLineEntryExtensionV2ExtBase;
