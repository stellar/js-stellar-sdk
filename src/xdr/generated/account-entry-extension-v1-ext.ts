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
  AccountEntryExtensionV2,
  type AccountEntryExtensionV2Wire,
} from "./account-entry-extension-v2.js";

export type AccountEntryExtensionV1ExtWire =
  | { v: 0 }
  | { v: 2; v2: AccountEntryExtensionV2Wire };

export type AccountEntryExtensionV1ExtVariantName = "v0" | "v2";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 2:
 *         AccountEntryExtensionV2 v2;
 *     }
 * ```
 */
abstract class AccountEntryExtensionV1ExtBase extends XdrValue {
  abstract readonly type: AccountEntryExtensionV1ExtVariantName;

  static readonly schema: XdrType<AccountEntryExtensionV1ExtWire> = union(
    "AccountEntryExtensionV1Ext",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v2", 2, field("v2", AccountEntryExtensionV2.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): AccountEntryExtensionV1ExtV0 {
    return new AccountEntryExtensionV1ExtV0();
  }

  static v2(v2: AccountEntryExtensionV2): AccountEntryExtensionV1ExtV2 {
    return new AccountEntryExtensionV1ExtV2(v2);
  }

  static fromXdrObject(
    wire: AccountEntryExtensionV1ExtWire,
  ): AccountEntryExtensionV1Ext {
    switch (wire.v) {
      case 0:
        return new AccountEntryExtensionV1ExtV0();
      case 2:
        return new AccountEntryExtensionV1ExtV2(
          AccountEntryExtensionV2.fromXdrObject(wire.v2),
        );
    }
  }

  abstract toXdrObject(): AccountEntryExtensionV1ExtWire;
}

export class AccountEntryExtensionV1ExtV0 extends AccountEntryExtensionV1ExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountEntryExtensionV1ExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class AccountEntryExtensionV1ExtV2 extends AccountEntryExtensionV1ExtBase {
  readonly type = "v2" as const;
  readonly v2: AccountEntryExtensionV2;

  constructor(v2: AccountEntryExtensionV2) {
    super();
    this.v2 = v2;
  }

  get value(): AccountEntryExtensionV2 {
    return this.v2;
  }

  toXdrObject(): Extract<AccountEntryExtensionV1ExtWire, { v: 2 }> {
    return { v: 2, v2: this.v2.toXdrObject() };
  }
}

export type AccountEntryExtensionV1Ext =
  | AccountEntryExtensionV1ExtV0
  | AccountEntryExtensionV1ExtV2;
export const AccountEntryExtensionV1Ext = AccountEntryExtensionV1ExtBase;
