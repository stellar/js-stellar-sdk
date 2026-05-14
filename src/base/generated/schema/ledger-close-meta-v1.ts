// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { GeneralizedTransactionSet } from "./generalized-transaction-set.js";
import { LedgerCloseMetaExt } from "./ledger-close-meta-ext.js";
import { LedgerEntry } from "./ledger-entry.js";
import { LedgerHeaderHistoryEntry } from "./ledger-header-history-entry.js";
import { LedgerKey } from "./ledger-key.js";
import { SCPHistoryEntry } from "./scp-history-entry.js";
import { TransactionResultMeta } from "./transaction-result-meta.js";
import { UpgradeEntryMeta } from "./upgrade-entry-meta.js";
export interface LedgerCloseMetaV1 {
  readonly ext: LedgerCloseMetaExt;
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: GeneralizedTransactionSet;
  readonly txProcessing: TransactionResultMeta[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: SCPHistoryEntry[];
  readonly totalByteSizeOfLiveSorobanState: bigint;
  readonly evictedKeys: LedgerKey[];
  readonly unused: LedgerEntry[];
}
export const LedgerCloseMetaV1 = xdr.struct("LedgerCloseMetaV1", {
  ext: xdr.lazy(() => LedgerCloseMetaExt),
  ledgerHeader: xdr.lazy(() => LedgerHeaderHistoryEntry),
  txSet: xdr.lazy(() => GeneralizedTransactionSet),
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
  totalByteSizeOfLiveSorobanState: xdr.uint64(),
  evictedKeys: xdr.array(
    xdr.lazy(() => LedgerKey),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  unused: xdr.array(
    xdr.lazy(() => LedgerEntry),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<LedgerCloseMetaV1>;
