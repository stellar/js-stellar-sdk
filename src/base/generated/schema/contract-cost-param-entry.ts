// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface ContractCostParamEntry {
  readonly ext: ExtensionPoint;
  readonly constTerm: bigint;
  readonly linearTerm: bigint;
}
export const ContractCostParamEntry = xdr.struct("ContractCostParamEntry", {
  ext: xdr.lazy(() => ExtensionPoint),
  constTerm: xdr.int64(),
  linearTerm: xdr.int64(),
}) as xdr.XdrType<ContractCostParamEntry>;
