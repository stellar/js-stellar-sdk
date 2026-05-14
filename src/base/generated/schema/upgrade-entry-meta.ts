// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { LedgerUpgrade } from "./ledger-upgrade.js";
export interface UpgradeEntryMeta {
  readonly upgrade: LedgerUpgrade;
  readonly changes: LedgerEntryChanges;
}
export const UpgradeEntryMeta = xdr.struct("UpgradeEntryMeta", {
  upgrade: xdr.lazy(() => LedgerUpgrade),
  changes: xdr.lazy(() => LedgerEntryChanges),
}) as xdr.XdrType<UpgradeEntryMeta>;
