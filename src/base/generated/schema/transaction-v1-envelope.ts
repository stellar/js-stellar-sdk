// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DecoratedSignature } from "./decorated-signature.js";
import { Transaction } from "./transaction.js";
export interface TransactionV1Envelope {
  readonly tx: Transaction;
  readonly signatures: DecoratedSignature[];
}
export const TransactionV1Envelope = xdr.struct("TransactionV1Envelope", {
  tx: xdr.lazy(() => Transaction),
  signatures: xdr.array(
    xdr.lazy(() => DecoratedSignature),
    20,
  ),
}) as xdr.XdrType<TransactionV1Envelope>;
