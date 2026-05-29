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
  AccountEntryExtensionV1,
  type AccountEntryExtensionV1Wire,
} from "./account-entry-extension-v1.js";

export type AccountEntryExtWire =
  | { v: 0 }
  | { v: 1; v1: AccountEntryExtensionV1Wire };

export type AccountEntryExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         AccountEntryExtensionV1 v1;
 *     }
 * ```
 */
abstract class AccountEntryExtBase extends XdrValue {
  abstract readonly type: AccountEntryExtVariantName;

  static readonly schema: XdrType<AccountEntryExtWire> = union(
    "AccountEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", AccountEntryExtensionV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): AccountEntryExtV0 {
    return new AccountEntryExtV0();
  }

  static v1(v1: AccountEntryExtensionV1): AccountEntryExtV1 {
    return new AccountEntryExtV1(v1);
  }

  static fromXdrObject(wire: AccountEntryExtWire): AccountEntryExt {
    switch (wire.v) {
      case 0:
        return new AccountEntryExtV0();
      case 1:
        return new AccountEntryExtV1(
          AccountEntryExtensionV1.fromXdrObject(wire.v1),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete AccountEntryExt variant.
   * Use this instead of `instanceof AccountEntryExt`: the exported `AccountEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `AccountEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is AccountEntryExt {
    return value instanceof AccountEntryExtBase;
  }

  abstract toXdrObject(): AccountEntryExtWire;
}

export class AccountEntryExtV0 extends AccountEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class AccountEntryExtV1 extends AccountEntryExtBase {
  readonly type = "v1" as const;
  readonly v1: AccountEntryExtensionV1;

  constructor(v1: AccountEntryExtensionV1) {
    super();
    this.v1 = v1;
  }

  get value(): AccountEntryExtensionV1 {
    return this.v1;
  }

  toXdrObject(): Extract<AccountEntryExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type AccountEntryExt = AccountEntryExtV0 | AccountEntryExtV1;
export const AccountEntryExt = AccountEntryExtBase;
