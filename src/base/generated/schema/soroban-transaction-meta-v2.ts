// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanTransactionMetaExt } from "./soroban-transaction-meta-ext.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface SorobanTransactionMetaV2 {
  readonly ext: SorobanTransactionMetaExt;
  readonly returnValue: SCVal | null;
}
export const SorobanTransactionMetaV2 = xdr.struct("SorobanTransactionMetaV2", {
  ext: xdr.lazy(() => SorobanTransactionMetaExt),
  returnValue: xdr.option(xdr.lazy(() => SCVal)),
}) as xdr.XdrType<SorobanTransactionMetaV2>;
