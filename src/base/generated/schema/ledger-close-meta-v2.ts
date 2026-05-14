// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { GeneralizedTransactionSet } from "./generalized-transaction-set.js";
import { LedgerCloseMetaExt } from "./ledger-close-meta-ext.js";
import { LedgerHeaderHistoryEntry } from "./ledger-header-history-entry.js";
import { LedgerKey } from "./ledger-key.js";
import { SCPHistoryEntry } from "./scp-history-entry.js";
import { TransactionResultMetaV1 } from "./transaction-result-meta-v1.js";
import { UpgradeEntryMeta } from "./upgrade-entry-meta.js";
export interface LedgerCloseMetaV2 {
  readonly ext: LedgerCloseMetaExt;
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: GeneralizedTransactionSet;
  readonly txProcessing: TransactionResultMetaV1[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: SCPHistoryEntry[];
  readonly totalByteSizeOfLiveSorobanState: bigint;
  readonly evictedKeys: LedgerKey[];
}
export const LedgerCloseMetaV2 = xdr.struct("LedgerCloseMetaV2", {
  ext: xdr.lazy(() => LedgerCloseMetaExt),
  ledgerHeader: xdr.lazy(() => LedgerHeaderHistoryEntry),
  txSet: xdr.lazy(() => GeneralizedTransactionSet),
  txProcessing: xdr.array(
    xdr.lazy(() => TransactionResultMetaV1),
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
}) as xdr.XdrType<LedgerCloseMetaV2>;
