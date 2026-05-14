// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const OperationType = xdr.enumType("OperationType", {
  createAccount: 0,
  payment: 1,
  pathPaymentStrictReceive: 2,
  manageSellOffer: 3,
  createPassiveSellOffer: 4,
  setOptions: 5,
  changeTrust: 6,
  allowTrust: 7,
  accountMerge: 8,
  inflation: 9,
  manageData: 10,
  bumpSequence: 11,
  manageBuyOffer: 12,
  pathPaymentStrictSend: 13,
  createClaimableBalance: 14,
  claimClaimableBalance: 15,
  beginSponsoringFutureReserves: 16,
  endSponsoringFutureReserves: 17,
  revokeSponsorship: 18,
  clawback: 19,
  clawbackClaimableBalance: 20,
  setTrustLineFlags: 21,
  liquidityPoolDeposit: 22,
  liquidityPoolWithdraw: 23,
  invokeHostFunction: 24,
  extendFootprintTtl: 25,
  restoreFootprint: 26,
} as const);
export type OperationType = xdr.Infer<typeof OperationType>;
