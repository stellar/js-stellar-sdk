// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Memo } from "./memo.js";
import { Operation } from "./operation.js";
import { SequenceNumber } from "./sequence-number.js";
import { TimeBounds } from "./time-bounds.js";
import { TransactionV0Ext } from "./transaction-v0-ext.js";
import { uint256 } from "./uint256.js";
export interface TransactionV0 {
  readonly sourceAccountEd25519: uint256;
  readonly fee: number;
  readonly seqNum: SequenceNumber;
  readonly timeBounds: TimeBounds | null;
  readonly memo: Memo;
  readonly operations: Operation[];
  readonly ext: TransactionV0Ext;
}
export const TransactionV0 = xdr.struct("TransactionV0", {
  sourceAccountEd25519: xdr.lazy(() => uint256),
  fee: xdr.uint32(),
  seqNum: xdr.lazy(() => SequenceNumber),
  timeBounds: xdr.option(xdr.lazy(() => TimeBounds)),
  memo: xdr.lazy(() => Memo),
  operations: xdr.array(
    xdr.lazy(() => Operation),
    100,
  ),
  ext: xdr.lazy(() => TransactionV0Ext),
}) as xdr.XdrType<TransactionV0>;
