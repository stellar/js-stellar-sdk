// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LedgerEntryType = xdr.enumType("LedgerEntryType", {
  account: 0,
  trustline: 1,
  offer: 2,
  data: 3,
  claimableBalance: 4,
  liquidityPool: 5,
  contractData: 6,
  contractCode: 7,
  configSetting: 8,
  ttl: 9,
} as const);
export type LedgerEntryType = xdr.Infer<typeof LedgerEntryType>;
