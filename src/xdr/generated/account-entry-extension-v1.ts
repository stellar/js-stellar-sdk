import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Liabilities, type LiabilitiesWire } from "./liabilities.js";
import {
  AccountEntryExtensionV1Ext,
  type AccountEntryExtensionV1ExtWire,
} from "./account-entry-extension-v1-ext.js";

export interface AccountEntryExtensionV1Wire {
  liabilities: LiabilitiesWire;
  ext: AccountEntryExtensionV1ExtWire;
}

/**
 * ```xdr
 * struct AccountEntryExtensionV1
 * {
 *     Liabilities liabilities;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 2:
 *         AccountEntryExtensionV2 v2;
 *     }
 *     ext;
 * };
 * ```
 */
export class AccountEntryExtensionV1 extends XdrValue {
  readonly liabilities: Liabilities;
  readonly ext: AccountEntryExtensionV1Ext;

  static readonly schema: XdrType<AccountEntryExtensionV1Wire> = struct(
    "AccountEntryExtensionV1",
    {
      liabilities: Liabilities.schema,
      ext: AccountEntryExtensionV1Ext.schema,
    },
  );

  constructor(input: {
    liabilities: Liabilities;
    ext: AccountEntryExtensionV1Ext;
  }) {
    super();
    this.liabilities = input.liabilities;
    this.ext = input.ext;
  }

  toXdrObject(): AccountEntryExtensionV1Wire {
    return {
      liabilities: this.liabilities.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: AccountEntryExtensionV1Wire,
  ): AccountEntryExtensionV1 {
    return new AccountEntryExtensionV1({
      liabilities: Liabilities.fromXdrObject(wire.liabilities),
      ext: AccountEntryExtensionV1Ext.fromXdrObject(wire.ext),
    });
  }
}
