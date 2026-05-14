// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const EnvelopeType = xdr.enumType("EnvelopeType", {
  envelopeTypeTxV0: 0,
  envelopeTypeScp: 1,
  envelopeTypeTx: 2,
  envelopeTypeAuth: 3,
  envelopeTypeScpvalue: 4,
  envelopeTypeTxFeeBump: 5,
  envelopeTypeOpId: 6,
  envelopeTypePoolRevokeOpId: 7,
  envelopeTypeContractId: 8,
  envelopeTypeSorobanAuthorization: 9,
} as const);
export type EnvelopeType = xdr.Infer<typeof EnvelopeType>;
