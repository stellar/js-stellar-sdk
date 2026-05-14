// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface SorobanTransactionMetaExtV1 {
  readonly ext: ExtensionPoint;
  readonly totalNonRefundableResourceFeeCharged: bigint;
  readonly totalRefundableResourceFeeCharged: bigint;
  readonly rentFeeCharged: bigint;
}
export const SorobanTransactionMetaExtV1 = xdr.struct(
  "SorobanTransactionMetaExtV1",
  {
    ext: xdr.lazy(() => ExtensionPoint),
    totalNonRefundableResourceFeeCharged: xdr.int64(),
    totalRefundableResourceFeeCharged: xdr.int64(),
    rentFeeCharged: xdr.int64(),
  },
) as xdr.XdrType<SorobanTransactionMetaExtV1>;
