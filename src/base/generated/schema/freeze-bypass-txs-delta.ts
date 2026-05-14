// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export interface FreezeBypassTxsDelta {
  readonly addTxs: Hash[];
  readonly removeTxs: Hash[];
}
export const FreezeBypassTxsDelta = xdr.struct("FreezeBypassTxsDelta", {
  addTxs: xdr.array(
    xdr.lazy(() => Hash),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  removeTxs: xdr.array(
    xdr.lazy(() => Hash),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<FreezeBypassTxsDelta>;
