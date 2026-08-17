/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
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

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === TrustLineEntryExtensionV2ExtBase) {
      throw new TypeError(
        "new xdr.TrustLineEntryExtensionV2Ext(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.TrustLineEntryExtensionV2Ext.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

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
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `TrustLineEntryExtensionV2Ext: unknown v ${(wire as { v: unknown }).v}`,
    );
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
