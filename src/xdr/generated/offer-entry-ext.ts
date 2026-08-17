/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type OfferEntryExtWire = { v: 0 };

export type OfferEntryExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class OfferEntryExtBase extends XdrValue {
  abstract readonly type: OfferEntryExtVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === OfferEntryExtBase) {
      throw new TypeError(
        "new xdr.OfferEntryExt(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.OfferEntryExt.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<OfferEntryExtWire> = union("OfferEntryExt", {
    switchOn: int32(),
    cases: [case_("v0", 0, voidType())],
    switchKey: "v",
  });

  static v0(): OfferEntryExtV0 {
    return new OfferEntryExtV0();
  }

  static fromXdrObject(wire: OfferEntryExtWire): OfferEntryExt {
    switch (wire.v) {
      case 0:
        return new OfferEntryExtV0();
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `OfferEntryExt: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete OfferEntryExt variant.
   * Use this instead of `instanceof OfferEntryExt`: the exported `OfferEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `OfferEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is OfferEntryExt {
    return value instanceof OfferEntryExtBase;
  }

  abstract toXdrObject(): OfferEntryExtWire;
}

export class OfferEntryExtV0 extends OfferEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<OfferEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type OfferEntryExt = OfferEntryExtV0;
export const OfferEntryExt = OfferEntryExtBase;
