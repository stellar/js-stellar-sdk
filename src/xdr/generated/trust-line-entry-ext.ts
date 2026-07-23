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
  TrustLineEntryV1,
  type TrustLineEntryV1Wire,
} from "./trust-line-entry-v1.js";

export type TrustLineEntryExtWire =
  | { v: 0 }
  | { v: 1; v1: TrustLineEntryV1Wire };

export type TrustLineEntryExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         struct
 *         {
 *             Liabilities liabilities;
 *
 *             union switch (int v)
 *             {
 *             case 0:
 *                 void;
 *             case 2:
 *                 TrustLineEntryExtensionV2 v2;
 *             }
 *             ext;
 *         } v1;
 *     }
 * ```
 */
abstract class TrustLineEntryExtBase extends XdrValue {
  abstract readonly type: TrustLineEntryExtVariantName;

  static readonly schema: XdrType<TrustLineEntryExtWire> = union(
    "TrustLineEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", TrustLineEntryV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): TrustLineEntryExtV0 {
    return new TrustLineEntryExtV0();
  }

  static v1(v1: TrustLineEntryV1): TrustLineEntryExtV1 {
    return new TrustLineEntryExtV1(v1);
  }

  static fromXdrObject(wire: TrustLineEntryExtWire): TrustLineEntryExt {
    switch (wire.v) {
      case 0:
        return new TrustLineEntryExtV0();
      case 1:
        return new TrustLineEntryExtV1(TrustLineEntryV1.fromXdrObject(wire.v1));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TrustLineEntryExt variant.
   * Use this instead of `instanceof TrustLineEntryExt`: the exported `TrustLineEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TrustLineEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TrustLineEntryExt {
    return value instanceof TrustLineEntryExtBase;
  }

  abstract toXdrObject(): TrustLineEntryExtWire;
}

export class TrustLineEntryExtV0 extends TrustLineEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TrustLineEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class TrustLineEntryExtV1 extends TrustLineEntryExtBase {
  readonly type = "v1" as const;
  readonly v1: TrustLineEntryV1;

  constructor(v1: TrustLineEntryV1) {
    super();
    this.v1 = v1;
  }

  get value(): TrustLineEntryV1 {
    return this.v1;
  }

  toXdrObject(): Extract<TrustLineEntryExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type TrustLineEntryExt = TrustLineEntryExtV0 | TrustLineEntryExtV1;
export const TrustLineEntryExt = TrustLineEntryExtBase;
