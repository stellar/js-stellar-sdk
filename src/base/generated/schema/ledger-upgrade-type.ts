// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LedgerUpgradeType = xdr.enumType("LedgerUpgradeType", {
  ledgerUpgradeVersion: 1,
  ledgerUpgradeBaseFee: 2,
  ledgerUpgradeMaxTxSetSize: 3,
  ledgerUpgradeBaseReserve: 4,
  ledgerUpgradeFlags: 5,
  ledgerUpgradeConfig: 6,
  ledgerUpgradeMaxSorobanTxSetSize: 7,
} as const);
export type LedgerUpgradeType = xdr.Infer<typeof LedgerUpgradeType>;
