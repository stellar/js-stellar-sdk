/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type FeeBumpTransactionExtWire = { v: 0 };

export type FeeBumpTransactionExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class FeeBumpTransactionExtBase extends XdrValue {
  abstract readonly type: FeeBumpTransactionExtVariantName;

  static readonly schema: XdrType<FeeBumpTransactionExtWire> = union(
    "FeeBumpTransactionExt",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): FeeBumpTransactionExtV0 {
    return new FeeBumpTransactionExtV0();
  }

  static fromXdrObject(wire: FeeBumpTransactionExtWire): FeeBumpTransactionExt {
    switch (wire.v) {
      case 0:
        return new FeeBumpTransactionExtV0();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete FeeBumpTransactionExt variant.
   * Use this instead of `instanceof FeeBumpTransactionExt`: the exported `FeeBumpTransactionExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `FeeBumpTransactionExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is FeeBumpTransactionExt {
    return value instanceof FeeBumpTransactionExtBase;
  }

  abstract toXdrObject(): FeeBumpTransactionExtWire;
}

export class FeeBumpTransactionExtV0 extends FeeBumpTransactionExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<FeeBumpTransactionExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type FeeBumpTransactionExt = FeeBumpTransactionExtV0;
export const FeeBumpTransactionExt = FeeBumpTransactionExtBase;
