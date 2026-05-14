// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { SignerKey } from "./signer-key.js";
export interface RevokeSponsorshipOpSigner {
  readonly accountId: AccountId;
  readonly signerKey: SignerKey;
}
export const RevokeSponsorshipOpSigner = xdr.struct(
  "RevokeSponsorshipOpSigner",
  {
    accountId: xdr.lazy(() => AccountId),
    signerKey: xdr.lazy(() => SignerKey),
  },
) as xdr.XdrType<RevokeSponsorshipOpSigner>;
