// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const TransactionEventStage = xdr.enumType("TransactionEventStage", {
  transactionEventStageBeforeAllTxs: 0,
  transactionEventStageAfterTx: 1,
  transactionEventStageAfterAllTxs: 2,
} as const);
export type TransactionEventStage = xdr.Infer<typeof TransactionEventStage>;
