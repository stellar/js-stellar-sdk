// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractCodeCostInputs } from "./contract-code-cost-inputs.js";
import { ExtensionPoint } from "./extension-point.js";
export interface ContractCodeEntryV1 {
  readonly ext: ExtensionPoint;
  readonly costInputs: ContractCodeCostInputs;
}
export const ContractCodeEntryV1 = xdr.struct("ContractCodeEntryV1", {
  ext: xdr.lazy(() => ExtensionPoint),
  costInputs: xdr.lazy(() => ContractCodeCostInputs),
}) as xdr.XdrType<ContractCodeEntryV1>;
