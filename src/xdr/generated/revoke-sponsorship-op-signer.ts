import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { SignerKey, type SignerKeyWire } from "./signer-key.js";

export interface RevokeSponsorshipOpSignerWire {
  accountId: PublicKeyWire;
  signerKey: SignerKeyWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID accountID;
 *         SignerKey signerKey;
 *     }
 * ```
 */
export class RevokeSponsorshipOpSigner extends XdrValue {
  readonly accountId: PublicKey;
  readonly signerKey: SignerKey;

  static readonly schema: XdrType<RevokeSponsorshipOpSignerWire> = struct(
    "RevokeSponsorshipOpSigner",
    {
      accountId: PublicKey.schema,
      signerKey: SignerKey.schema,
    },
  );

  constructor(input: { accountId: PublicKey; signerKey: SignerKey }) {
    super();
    this.accountId = input.accountId;
    this.signerKey = input.signerKey;
  }

  toXdrObject(): RevokeSponsorshipOpSignerWire {
    return {
      accountId: this.accountId.toXdrObject(),
      signerKey: this.signerKey.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: RevokeSponsorshipOpSignerWire,
  ): RevokeSponsorshipOpSigner {
    return new RevokeSponsorshipOpSigner({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      signerKey: SignerKey.fromXdrObject(wire.signerKey),
    });
  }
}
