// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { LedgerHeader } from "./ledger-header.js";
import { LedgerHeaderHistoryEntryExt } from "./ledger-header-history-entry-ext.js";
export interface LedgerHeaderHistoryEntry {
  readonly hash: Hash;
  readonly header: LedgerHeader;
  readonly ext: LedgerHeaderHistoryEntryExt;
}
export const LedgerHeaderHistoryEntry = xdr.struct("LedgerHeaderHistoryEntry", {
  hash: xdr.lazy(() => Hash),
  header: xdr.lazy(() => LedgerHeader),
  ext: xdr.lazy(() => LedgerHeaderHistoryEntryExt),
}) as xdr.XdrType<LedgerHeaderHistoryEntry>;
