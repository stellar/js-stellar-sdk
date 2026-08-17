/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type ExtensionPointWire = { v: 0 };

export type ExtensionPointVariantName = "v0";

/**
 * ```xdr
 * union ExtensionPoint switch (int v)
 * {
 * case 0:
 *     void;
 * };
 * ```
 */
abstract class ExtensionPointBase extends XdrValue {
  abstract readonly type: ExtensionPointVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === ExtensionPointBase) {
      throw new TypeError(
        "new xdr.ExtensionPoint(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.ExtensionPoint.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<ExtensionPointWire> = union(
    "ExtensionPoint",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): ExtensionPointV0 {
    return new ExtensionPointV0();
  }

  static fromXdrObject(wire: ExtensionPointWire): ExtensionPoint {
    switch (wire.v) {
      case 0:
        return new ExtensionPointV0();
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `ExtensionPoint: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete ExtensionPoint variant.
   * Use this instead of `instanceof ExtensionPoint`: the exported `ExtensionPoint` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ExtensionPoint.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ExtensionPoint {
    return value instanceof ExtensionPointBase;
  }

  abstract toXdrObject(): ExtensionPointWire;
}

export class ExtensionPointV0 extends ExtensionPointBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ExtensionPointWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type ExtensionPoint = ExtensionPointV0;
export const ExtensionPoint = ExtensionPointBase;
