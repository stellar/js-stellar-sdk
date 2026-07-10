import { struct, uint32, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface AccountEntryExtensionV3Wire {
  ext: ExtensionPointWire;
  seqLedger: number;
  seqTime: bigint;
}

/**
 * ```xdr
 * struct AccountEntryExtensionV3
 * {
 *     // We can use this to add more fields, or because it is first, to
 *     // change AccountEntryExtensionV3 into a union.
 *     ExtensionPoint ext;
 *
 *     // Ledger number at which `seqNum` took on its present value.
 *     uint32 seqLedger;
 *
 *     // Time at which `seqNum` took on its present value.
 *     TimePoint seqTime;
 * };
 * ```
 */
export class AccountEntryExtensionV3 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly seqLedger: number;
  readonly seqTime: bigint;

  static readonly schema: XdrType<AccountEntryExtensionV3Wire> = struct(
    "AccountEntryExtensionV3",
    {
      ext: ExtensionPoint.schema,
      seqLedger: uint32(),
      seqTime: uint64(),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    seqLedger: number;
    seqTime: bigint;
  }) {
    super();
    this.ext = input.ext;
    this.seqLedger = input.seqLedger;
    this.seqTime = input.seqTime;
  }

  toXdrObject(): AccountEntryExtensionV3Wire {
    return {
      ext: this.ext.toXdrObject(),
      seqLedger: this.seqLedger,
      seqTime: this.seqTime,
    };
  }

  static fromXdrObject(
    wire: AccountEntryExtensionV3Wire,
  ): AccountEntryExtensionV3 {
    return new AccountEntryExtensionV3({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      seqLedger: wire.seqLedger,
      seqTime: wire.seqTime,
    });
  }
}
