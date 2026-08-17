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
import { XdrError, type XdrType } from "@stellar/js-xdr";
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

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === AccountEntryExtensionV1ExtBase) {
      throw new TypeError(
        "new xdr.AccountEntryExtensionV1Ext(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.AccountEntryExtensionV1Ext.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

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
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `AccountEntryExtensionV1Ext: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete AccountEntryExtensionV1Ext variant.
   * Use this instead of `instanceof AccountEntryExtensionV1Ext`: the exported `AccountEntryExtensionV1Ext` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `AccountEntryExtensionV1Ext.is(x)` narrows to the union.
   */
  static is(value: unknown): value is AccountEntryExtensionV1Ext {
    return value instanceof AccountEntryExtensionV1ExtBase;
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
