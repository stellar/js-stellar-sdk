// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Memo } from "./memo.js";
import { MuxedAccount } from "./muxed-account.js";
import { Operation } from "./operation.js";
import { Preconditions } from "./preconditions.js";
import { SequenceNumber } from "./sequence-number.js";
import { TransactionExt } from "./transaction-ext.js";
export interface Transaction {
  readonly sourceAccount: MuxedAccount;
  readonly fee: number;
  readonly seqNum: SequenceNumber;
  readonly cond: Preconditions;
  readonly memo: Memo;
  readonly operations: Operation[];
  readonly ext: TransactionExt;
}
export const Transaction = xdr.struct("Transaction", {
  sourceAccount: xdr.lazy(() => MuxedAccount),
  fee: xdr.uint32(),
  seqNum: xdr.lazy(() => SequenceNumber),
  cond: xdr.lazy(() => Preconditions),
  memo: xdr.lazy(() => Memo),
  operations: xdr.array(
    xdr.lazy(() => Operation),
    100,
  ),
  ext: xdr.lazy(() => TransactionExt),
}) as xdr.XdrType<Transaction>;
