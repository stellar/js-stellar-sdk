// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const BumpSequenceResultCode = xdr.enumType("BumpSequenceResultCode", {
  bumpSequenceSuccess: 0,
  bumpSequenceBadSeq: -1,
} as const);
export type BumpSequenceResultCode = xdr.Infer<typeof BumpSequenceResultCode>;
