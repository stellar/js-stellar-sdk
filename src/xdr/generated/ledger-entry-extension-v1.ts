import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import {
  LedgerEntryExtensionV1Ext,
  type LedgerEntryExtensionV1ExtWire,
} from "./ledger-entry-extension-v1-ext.js";

export interface LedgerEntryExtensionV1Wire {
  sponsoringId: PublicKeyWire | null;
  ext: LedgerEntryExtensionV1ExtWire;
}

/**
 * ```xdr
 * struct LedgerEntryExtensionV1
 * {
 *     SponsorshipDescriptor sponsoringID;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class LedgerEntryExtensionV1 extends XdrValue {
  readonly sponsoringId: PublicKey | null;
  readonly ext: LedgerEntryExtensionV1Ext;

  static readonly schema: XdrType<LedgerEntryExtensionV1Wire> = struct(
    "LedgerEntryExtensionV1",
    {
      sponsoringId: option(PublicKey.schema),
      ext: LedgerEntryExtensionV1Ext.schema,
    },
  );

  constructor(input: {
    sponsoringId: PublicKey | null;
    ext: LedgerEntryExtensionV1Ext;
  }) {
    super();
    this.sponsoringId = input.sponsoringId;
    this.ext = input.ext;
  }

  toXdrObject(): LedgerEntryExtensionV1Wire {
    return {
      sponsoringId:
        this.sponsoringId === null ? null : this.sponsoringId.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerEntryExtensionV1Wire,
  ): LedgerEntryExtensionV1 {
    return new LedgerEntryExtensionV1({
      sponsoringId:
        wire.sponsoringId === null
          ? null
          : PublicKey.fromXdrObject(wire.sponsoringId),
      ext: LedgerEntryExtensionV1Ext.fromXdrObject(wire.ext),
    });
  }
}
