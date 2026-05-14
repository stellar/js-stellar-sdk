// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionEnvelope } from "./transaction-envelope.js";
export interface TxSetComponentTxsMaybeDiscountedFee {
  readonly baseFee: bigint | null;
  readonly txs: TransactionEnvelope[];
}
export const TxSetComponentTxsMaybeDiscountedFee = xdr.struct(
  "TxSetComponentTxsMaybeDiscountedFee",
  {
    baseFee: xdr.option(xdr.int64()),
    txs: xdr.array(
      xdr.lazy(() => TransactionEnvelope),
      xdr.UNBOUNDED_MAX_LENGTH,
    ),
  },
) as xdr.XdrType<TxSetComponentTxsMaybeDiscountedFee>;
