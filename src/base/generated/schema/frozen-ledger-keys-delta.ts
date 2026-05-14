// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EncodedLedgerKey } from "./encoded-ledger-key.js";
export interface FrozenLedgerKeysDelta {
  readonly keysToFreeze: EncodedLedgerKey[];
  readonly keysToUnfreeze: EncodedLedgerKey[];
}
export const FrozenLedgerKeysDelta = xdr.struct("FrozenLedgerKeysDelta", {
  keysToFreeze: xdr.array(
    xdr.lazy(() => EncodedLedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  keysToUnfreeze: xdr.array(
    xdr.lazy(() => EncodedLedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<FrozenLedgerKeysDelta>;
