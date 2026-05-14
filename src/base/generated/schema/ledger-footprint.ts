// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerKey } from "./ledger-key.js";
export interface LedgerFootprint {
  readonly readOnly: LedgerKey[];
  readonly readWrite: LedgerKey[];
}
export const LedgerFootprint = xdr.struct("LedgerFootprint", {
  readOnly: xdr.array(
    xdr.lazy(() => LedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  readWrite: xdr.array(
    xdr.lazy(() => LedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<LedgerFootprint>;
