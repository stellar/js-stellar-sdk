// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export type EncodedLedgerKey = Uint8Array;
export const EncodedLedgerKey = xdr.varOpaque(
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<EncodedLedgerKey>;
