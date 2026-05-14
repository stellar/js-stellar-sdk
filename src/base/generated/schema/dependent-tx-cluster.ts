// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionEnvelope } from "./transaction-envelope.js";
export type DependentTxCluster = TransactionEnvelope[];
export const DependentTxCluster = xdr.array(
  xdr.lazy(() => TransactionEnvelope),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<DependentTxCluster>;
