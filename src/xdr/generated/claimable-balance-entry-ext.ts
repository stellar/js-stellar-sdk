/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceEntryExtensionV1,
  type ClaimableBalanceEntryExtensionV1Wire,
} from "./claimable-balance-entry-extension-v1.js";

export type ClaimableBalanceEntryExtWire =
  | { v: 0 }
  | { v: 1; v1: ClaimableBalanceEntryExtensionV1Wire };

export type ClaimableBalanceEntryExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         ClaimableBalanceEntryExtensionV1 v1;
 *     }
 * ```
 */
abstract class ClaimableBalanceEntryExtBase extends XdrValue {
  abstract readonly type: ClaimableBalanceEntryExtVariantName;

  static readonly schema: XdrType<ClaimableBalanceEntryExtWire> = union(
    "ClaimableBalanceEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", ClaimableBalanceEntryExtensionV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): ClaimableBalanceEntryExtV0 {
    return new ClaimableBalanceEntryExtV0();
  }

  static v1(v1: ClaimableBalanceEntryExtensionV1): ClaimableBalanceEntryExtV1 {
    return new ClaimableBalanceEntryExtV1(v1);
  }

  static fromXdrObject(
    wire: ClaimableBalanceEntryExtWire,
  ): ClaimableBalanceEntryExt {
    switch (wire.v) {
      case 0:
        return new ClaimableBalanceEntryExtV0();
      case 1:
        return new ClaimableBalanceEntryExtV1(
          ClaimableBalanceEntryExtensionV1.fromXdrObject(wire.v1),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ClaimableBalanceEntryExt variant.
   * Use this instead of `instanceof ClaimableBalanceEntryExt`: the exported `ClaimableBalanceEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ClaimableBalanceEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ClaimableBalanceEntryExt {
    return value instanceof ClaimableBalanceEntryExtBase;
  }

  abstract toXdrObject(): ClaimableBalanceEntryExtWire;
}

export class ClaimableBalanceEntryExtV0 extends ClaimableBalanceEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimableBalanceEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class ClaimableBalanceEntryExtV1 extends ClaimableBalanceEntryExtBase {
  readonly type = "v1" as const;
  readonly v1: ClaimableBalanceEntryExtensionV1;

  constructor(v1: ClaimableBalanceEntryExtensionV1) {
    super();
    this.v1 = v1;
  }

  get value(): ClaimableBalanceEntryExtensionV1 {
    return this.v1;
  }

  toXdrObject(): Extract<ClaimableBalanceEntryExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type ClaimableBalanceEntryExt =
  | ClaimableBalanceEntryExtV0
  | ClaimableBalanceEntryExtV1;
export const ClaimableBalanceEntryExt = ClaimableBalanceEntryExtBase;
