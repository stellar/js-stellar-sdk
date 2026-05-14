// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export interface TTLEntry {
  readonly keyHash: Hash;
  readonly liveUntilLedgerSeq: number;
}
export const TTLEntry = xdr.struct("TTLEntry", {
  keyHash: xdr.lazy(() => Hash),
  liveUntilLedgerSeq: xdr.uint32(),
}) as xdr.XdrType<TTLEntry>;
