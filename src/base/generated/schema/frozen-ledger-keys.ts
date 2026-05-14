// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EncodedLedgerKey } from "./encoded-ledger-key.js";
export interface FrozenLedgerKeys {
  readonly keys: EncodedLedgerKey[];
}
export const FrozenLedgerKeys = xdr.struct("FrozenLedgerKeys", {
  keys: xdr.array(
    xdr.lazy(() => EncodedLedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<FrozenLedgerKeys>;
