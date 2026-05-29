/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
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
