// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChange } from "./ledger-entry-change.js";
export type LedgerEntryChanges = LedgerEntryChange[];
export const LedgerEntryChanges = xdr.array(
  xdr.lazy(() => LedgerEntryChange),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<LedgerEntryChanges>;
