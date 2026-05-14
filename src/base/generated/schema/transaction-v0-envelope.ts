// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DecoratedSignature } from "./decorated-signature.js";
import { TransactionV0 } from "./transaction-v0.js";
export interface TransactionV0Envelope {
  readonly tx: TransactionV0;
  readonly signatures: DecoratedSignature[];
}
export const TransactionV0Envelope = xdr.struct("TransactionV0Envelope", {
  tx: xdr.lazy(() => TransactionV0),
  signatures: xdr.array(
    xdr.lazy(() => DecoratedSignature),
    20,
  ),
}) as xdr.XdrType<TransactionV0Envelope>;
