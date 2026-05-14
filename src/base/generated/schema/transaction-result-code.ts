// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const TransactionResultCode = xdr.enumType("TransactionResultCode", {
  txFeeBumpInnerSuccess: 1,
  txSuccess: 0,
  txFailed: -1,
  txTooEarly: -2,
  txTooLate: -3,
  txMissingOperation: -4,
  txBadSeq: -5,
  txBadAuth: -6,
  txInsufficientBalance: -7,
  txNoAccount: -8,
  txInsufficientFee: -9,
  txBadAuthExtra: -10,
  txInternalError: -11,
  txNotSupported: -12,
  txFeeBumpInnerFailed: -13,
  txBadSponsorship: -14,
  txBadMinSeqAgeOrGap: -15,
  txMalformed: -16,
  txSorobanInvalid: -17,
  txFrozenKeyAccessed: -18,
} as const);
export type TransactionResultCode = xdr.Infer<typeof TransactionResultCode>;
