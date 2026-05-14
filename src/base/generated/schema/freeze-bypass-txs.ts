// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export interface FreezeBypassTxs {
  readonly txHashes: Hash[];
}
export const FreezeBypassTxs = xdr.struct("FreezeBypassTxs", {
  txHashes: xdr.array(
    xdr.lazy(() => Hash),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<FreezeBypassTxs>;
