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
  AccountEntryExtensionV3,
  type AccountEntryExtensionV3Wire,
} from "./account-entry-extension-v3.js";

export type AccountEntryExtensionV2ExtWire =
  | { v: 0 }
  | { v: 3; v3: AccountEntryExtensionV3Wire };

export type AccountEntryExtensionV2ExtVariantName = "v0" | "v3";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 3:
 *         AccountEntryExtensionV3 v3;
 *     }
 * ```
 */
abstract class AccountEntryExtensionV2ExtBase extends XdrValue {
  abstract readonly type: AccountEntryExtensionV2ExtVariantName;

  static readonly schema: XdrType<AccountEntryExtensionV2ExtWire> = union(
    "AccountEntryExtensionV2Ext",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v3", 3, field("v3", AccountEntryExtensionV3.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): AccountEntryExtensionV2ExtV0 {
    return new AccountEntryExtensionV2ExtV0();
  }

  static v3(v3: AccountEntryExtensionV3): AccountEntryExtensionV2ExtV3 {
    return new AccountEntryExtensionV2ExtV3(v3);
  }

  static fromXdrObject(
    wire: AccountEntryExtensionV2ExtWire,
  ): AccountEntryExtensionV2Ext {
    switch (wire.v) {
      case 0:
        return new AccountEntryExtensionV2ExtV0();
      case 3:
        return new AccountEntryExtensionV2ExtV3(
          AccountEntryExtensionV3.fromXdrObject(wire.v3),
        );
    }
  }

  abstract toXdrObject(): AccountEntryExtensionV2ExtWire;
}

export class AccountEntryExtensionV2ExtV0 extends AccountEntryExtensionV2ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountEntryExtensionV2ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class AccountEntryExtensionV2ExtV3 extends AccountEntryExtensionV2ExtBase {
  readonly type = "v3" as const;
  readonly v3: AccountEntryExtensionV3;

  constructor(v3: AccountEntryExtensionV3) {
    super();
    this.v3 = v3;
  }

  get value(): AccountEntryExtensionV3 {
    return this.v3;
  }

  toXdrObject(): Extract<AccountEntryExtensionV2ExtWire, { v: 3 }> {
    return { v: 3, v3: this.v3.toXdrObject() };
  }
}

export type AccountEntryExtensionV2Ext =
  | AccountEntryExtensionV2ExtV0
  | AccountEntryExtensionV2ExtV3;
export const AccountEntryExtensionV2Ext = AccountEntryExtensionV2ExtBase;
