/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type ClaimableBalanceEntryExtensionV1ExtWire = { v: 0 };

export type ClaimableBalanceEntryExtensionV1ExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class ClaimableBalanceEntryExtensionV1ExtBase extends XdrValue {
  abstract readonly type: ClaimableBalanceEntryExtensionV1ExtVariantName;

  static readonly schema: XdrType<ClaimableBalanceEntryExtensionV1ExtWire> =
    union("ClaimableBalanceEntryExtensionV1Ext", {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    });

  static v0(): ClaimableBalanceEntryExtensionV1ExtV0 {
    return new ClaimableBalanceEntryExtensionV1ExtV0();
  }

  static fromXdrObject(
    wire: ClaimableBalanceEntryExtensionV1ExtWire,
  ): ClaimableBalanceEntryExtensionV1Ext {
    switch (wire.v) {
      case 0:
        return new ClaimableBalanceEntryExtensionV1ExtV0();
    }
  }

  abstract toXdrObject(): ClaimableBalanceEntryExtensionV1ExtWire;
}

export class ClaimableBalanceEntryExtensionV1ExtV0 extends ClaimableBalanceEntryExtensionV1ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimableBalanceEntryExtensionV1ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type ClaimableBalanceEntryExtensionV1Ext =
  ClaimableBalanceEntryExtensionV1ExtV0;
export const ClaimableBalanceEntryExtensionV1Ext =
  ClaimableBalanceEntryExtensionV1ExtBase;
