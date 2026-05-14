// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerHeaderHistoryEntry } from "./ledger-header-history-entry.js";
import { SCPHistoryEntry } from "./scp-history-entry.js";
import { TransactionResultMeta } from "./transaction-result-meta.js";
import { TransactionSet } from "./transaction-set.js";
import { UpgradeEntryMeta } from "./upgrade-entry-meta.js";
export interface LedgerCloseMetaV0 {
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: TransactionSet;
  readonly txProcessing: TransactionResultMeta[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: SCPHistoryEntry[];
}
export const LedgerCloseMetaV0 = xdr.struct("LedgerCloseMetaV0", {
  ledgerHeader: xdr.lazy(() => LedgerHeaderHistoryEntry),
  txSet: xdr.lazy(() => TransactionSet),
  txProcessing: xdr.array(
    xdr.lazy(() => TransactionResultMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  upgradesProcessing: xdr.array(
    xdr.lazy(() => UpgradeEntryMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  scpInfo: xdr.array(
    xdr.lazy(() => SCPHistoryEntry),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<LedgerCloseMetaV0>;
