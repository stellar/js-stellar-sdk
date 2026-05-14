// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const CryptoKeyType = xdr.enumType("CryptoKeyType", {
  keyTypeEd25519: 0,
  keyTypePreAuthTx: 1,
  keyTypeHashX: 2,
  keyTypeEd25519SignedPayload: 3,
  keyTypeMuxedEd25519: 256,
} as const);
export type CryptoKeyType = xdr.Infer<typeof CryptoKeyType>;
