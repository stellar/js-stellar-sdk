// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SignerKeyType = xdr.enumType("SignerKeyType", {
  signerKeyTypeEd25519: 0,
  signerKeyTypePreAuthTx: 1,
  signerKeyTypeHashX: 2,
  signerKeyTypeEd25519SignedPayload: 3,
} as const);
export type SignerKeyType = xdr.Infer<typeof SignerKeyType>;
