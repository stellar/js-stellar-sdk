// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanResources } from "./soroban-resources.js";
import { SorobanTransactionDataExt } from "./soroban-transaction-data-ext.js";
export interface SorobanTransactionData {
  readonly ext: SorobanTransactionDataExt;
  readonly resources: SorobanResources;
  readonly resourceFee: bigint;
}
export const SorobanTransactionData = xdr.struct("SorobanTransactionData", {
  ext: xdr.lazy(() => SorobanTransactionDataExt),
  resources: xdr.lazy(() => SorobanResources),
  resourceFee: xdr.int64(),
}) as xdr.XdrType<SorobanTransactionData>;
