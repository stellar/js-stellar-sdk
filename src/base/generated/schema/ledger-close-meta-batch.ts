// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerCloseMeta } from "./ledger-close-meta.js";
export interface LedgerCloseMetaBatch {
  readonly startSequence: number;
  readonly endSequence: number;
  readonly ledgerCloseMetas: LedgerCloseMeta[];
}
export const LedgerCloseMetaBatch = xdr.struct("LedgerCloseMetaBatch", {
  startSequence: xdr.uint32(),
  endSequence: xdr.uint32(),
  ledgerCloseMetas: xdr.array(
    xdr.lazy(() => LedgerCloseMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<LedgerCloseMetaBatch>;
