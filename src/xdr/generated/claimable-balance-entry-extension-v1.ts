import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceEntryExtensionV1Ext,
  type ClaimableBalanceEntryExtensionV1ExtWire,
} from "./claimable-balance-entry-extension-v1-ext.js";

export interface ClaimableBalanceEntryExtensionV1Wire {
  ext: ClaimableBalanceEntryExtensionV1ExtWire;
  flags: number;
}

/**
 * ```xdr
 * struct ClaimableBalanceEntryExtensionV1
 * {
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 *
 *     uint32 flags; // see ClaimableBalanceFlags
 * };
 * ```
 */
export class ClaimableBalanceEntryExtensionV1 extends XdrValue {
  readonly ext: ClaimableBalanceEntryExtensionV1Ext;
  readonly flags: number;

  static readonly schema: XdrType<ClaimableBalanceEntryExtensionV1Wire> =
    struct("ClaimableBalanceEntryExtensionV1", {
      ext: ClaimableBalanceEntryExtensionV1Ext.schema,
      flags: uint32(),
    });

  constructor(input: {
    ext: ClaimableBalanceEntryExtensionV1Ext;
    flags: number;
  }) {
    super();
    this.ext = input.ext;
    this.flags = input.flags;
  }

  toXdrObject(): ClaimableBalanceEntryExtensionV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      flags: this.flags,
    };
  }

  static fromXdrObject(
    wire: ClaimableBalanceEntryExtensionV1Wire,
  ): ClaimableBalanceEntryExtensionV1 {
    return new ClaimableBalanceEntryExtensionV1({
      ext: ClaimableBalanceEntryExtensionV1Ext.fromXdrObject(wire.ext),
      flags: wire.flags,
    });
  }
}
