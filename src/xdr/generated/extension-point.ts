/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
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
