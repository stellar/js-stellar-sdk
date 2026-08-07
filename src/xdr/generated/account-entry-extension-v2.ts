import { array, option, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import {
  AccountEntryExtensionV2Ext,
  type AccountEntryExtensionV2ExtWire,
} from "./account-entry-extension-v2-ext.js";

export interface AccountEntryExtensionV2Wire {
  numSponsored: number;
  numSponsoring: number;
  signerSponsoringIDs: (PublicKeyWire | null)[];
  ext: AccountEntryExtensionV2ExtWire;
}

/**
 * ```xdr
 * struct AccountEntryExtensionV2
 * {
 *     uint32 numSponsored;
 *     uint32 numSponsoring;
 *     SponsorshipDescriptor signerSponsoringIDs<MAX_SIGNERS>;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 3:
 *         AccountEntryExtensionV3 v3;
 *     }
 *     ext;
 * };
 * ```
 */
export class AccountEntryExtensionV2 extends XdrValue {
  readonly numSponsored: number;
  readonly numSponsoring: number;
  readonly signerSponsoringIDs: (PublicKey | null)[];
  readonly ext: AccountEntryExtensionV2Ext;

  static readonly schema: XdrType<AccountEntryExtensionV2Wire> = struct(
    "AccountEntryExtensionV2",
    {
      numSponsored: uint32(),
      numSponsoring: uint32(),
      signerSponsoringIDs: array(option(PublicKey.schema), 20),
      ext: AccountEntryExtensionV2Ext.schema,
    },
  );

  constructor(input: {
    numSponsored: number;
    numSponsoring: number;
    signerSponsoringIDs: (PublicKey | null)[];
    ext: AccountEntryExtensionV2Ext;
  }) {
    super();
    this.numSponsored = input.numSponsored;
    this.numSponsoring = input.numSponsoring;
    this.signerSponsoringIDs = input.signerSponsoringIDs;
    this.ext = input.ext;
  }

  toXdrObject(): AccountEntryExtensionV2Wire {
    return {
      numSponsored: this.numSponsored,
      numSponsoring: this.numSponsoring,
      signerSponsoringIDs: this.signerSponsoringIDs.map((v) =>
        v === null ? null : v.toXdrObject(),
      ),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: AccountEntryExtensionV2Wire,
  ): AccountEntryExtensionV2 {
    return new AccountEntryExtensionV2({
      numSponsored: wire.numSponsored,
      numSponsoring: wire.numSponsoring,
      signerSponsoringIDs: wire.signerSponsoringIDs.map((w) =>
        w === null ? null : PublicKey.fromXdrObject(w),
      ),
      ext: AccountEntryExtensionV2Ext.fromXdrObject(wire.ext),
    });
  }
}
