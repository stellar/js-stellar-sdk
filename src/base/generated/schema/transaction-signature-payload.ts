// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { TransactionSignaturePayloadTaggedTransaction } from "./transaction-signature-payload-tagged-transaction.js";
export interface TransactionSignaturePayload {
  readonly networkId: Hash;
  readonly taggedTransaction: TransactionSignaturePayloadTaggedTransaction;
}
export const TransactionSignaturePayload = xdr.struct(
  "TransactionSignaturePayload",
  {
    networkId: xdr.lazy(() => Hash),
    taggedTransaction: xdr.lazy(
      () => TransactionSignaturePayloadTaggedTransaction,
    ),
  },
) as xdr.XdrType<TransactionSignaturePayload>;
