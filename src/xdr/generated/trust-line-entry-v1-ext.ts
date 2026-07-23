/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import {
  case as case_,
  field,
  int32,
  union,
  void as voidType,
} from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TrustLineEntryExtensionV2,
  type TrustLineEntryExtensionV2Wire,
} from "./trust-line-entry-extension-v2.js";

export type TrustLineEntryV1ExtWire =
  | { v: 0 }
  | { v: 2; v2: TrustLineEntryExtensionV2Wire };

export type TrustLineEntryV1ExtVariantName = "v0" | "v2";

/**
 * ```xdr
 * union switch (int v)
 *             {
 *             case 0:
 *                 void;
 *             case 2:
 *                 TrustLineEntryExtensionV2 v2;
 *             }
 * ```
 */
abstract class TrustLineEntryV1ExtBase extends XdrValue {
  abstract readonly type: TrustLineEntryV1ExtVariantName;

  static readonly schema: XdrType<TrustLineEntryV1ExtWire> = union(
    "TrustLineEntryV1Ext",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v2", 2, field("v2", TrustLineEntryExtensionV2.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): TrustLineEntryV1ExtV0 {
    return new TrustLineEntryV1ExtV0();
  }

  static v2(v2: TrustLineEntryExtensionV2): TrustLineEntryV1ExtV2 {
    return new TrustLineEntryV1ExtV2(v2);
  }

  static fromXdrObject(wire: TrustLineEntryV1ExtWire): TrustLineEntryV1Ext {
    switch (wire.v) {
      case 0:
        return new TrustLineEntryV1ExtV0();
      case 2:
        return new TrustLineEntryV1ExtV2(
          TrustLineEntryExtensionV2.fromXdrObject(wire.v2),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TrustLineEntryV1Ext variant.
   * Use this instead of `instanceof TrustLineEntryV1Ext`: the exported `TrustLineEntryV1Ext` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TrustLineEntryV1Ext.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TrustLineEntryV1Ext {
    return value instanceof TrustLineEntryV1ExtBase;
  }

  abstract toXdrObject(): TrustLineEntryV1ExtWire;
}

export class TrustLineEntryV1ExtV0 extends TrustLineEntryV1ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TrustLineEntryV1ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class TrustLineEntryV1ExtV2 extends TrustLineEntryV1ExtBase {
  readonly type = "v2" as const;
  readonly v2: TrustLineEntryExtensionV2;

  constructor(v2: TrustLineEntryExtensionV2) {
    super();
    this.v2 = v2;
  }

  get value(): TrustLineEntryExtensionV2 {
    return this.v2;
  }

  toXdrObject(): Extract<TrustLineEntryV1ExtWire, { v: 2 }> {
    return { v: 2, v2: this.v2.toXdrObject() };
  }
}

export type TrustLineEntryV1Ext = TrustLineEntryV1ExtV0 | TrustLineEntryV1ExtV2;
export const TrustLineEntryV1Ext = TrustLineEntryV1ExtBase;
