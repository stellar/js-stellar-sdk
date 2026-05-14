// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LedgerEntryChangeType = xdr.enumType("LedgerEntryChangeType", {
  ledgerEntryCreated: 0,
  ledgerEntryUpdated: 1,
  ledgerEntryRemoved: 2,
  ledgerEntryState: 3,
  ledgerEntryRestored: 4,
} as const);
export type LedgerEntryChangeType = xdr.Infer<typeof LedgerEntryChangeType>;
