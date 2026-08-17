/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, int32, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export type DataEntryExtWire = { v: 0 };

export type DataEntryExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class DataEntryExtBase extends XdrValue {
  abstract readonly type: DataEntryExtVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === DataEntryExtBase) {
      throw new TypeError(
        "new xdr.DataEntryExt(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.DataEntryExt.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<DataEntryExtWire> = union("DataEntryExt", {
    switchOn: int32(),
    cases: [case_("v0", 0, voidType())],
    switchKey: "v",
  });

  static v0(): DataEntryExtV0 {
    return new DataEntryExtV0();
  }

  static fromXdrObject(wire: DataEntryExtWire): DataEntryExt {
    switch (wire.v) {
      case 0:
        return new DataEntryExtV0();
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(`DataEntryExt: unknown v ${(wire as { v: unknown }).v}`);
  }

  /**
   * Type guard narrowing an unknown value to a concrete DataEntryExt variant.
   * Use this instead of `instanceof DataEntryExt`: the exported `DataEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `DataEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is DataEntryExt {
    return value instanceof DataEntryExtBase;
  }

  abstract toXdrObject(): DataEntryExtWire;
}

export class DataEntryExtV0 extends DataEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<DataEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type DataEntryExt = DataEntryExtV0;
export const DataEntryExt = DataEntryExtBase;
