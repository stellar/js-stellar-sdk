// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryData } from "./ledger-entry-data.js";
import { LedgerEntryExt } from "./ledger-entry-ext.js";
export interface LedgerEntry {
  readonly lastModifiedLedgerSeq: number;
  readonly data: LedgerEntryData;
  readonly ext: LedgerEntryExt;
}
export const LedgerEntry = xdr.struct("LedgerEntry", {
  lastModifiedLedgerSeq: xdr.uint32(),
  data: xdr.lazy(() => LedgerEntryData),
  ext: xdr.lazy(() => LedgerEntryExt),
}) as xdr.XdrType<LedgerEntry>;
