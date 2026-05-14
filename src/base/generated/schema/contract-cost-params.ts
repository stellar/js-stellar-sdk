// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractCostParamEntry } from "./contract-cost-param-entry.js";
export type ContractCostParams = ContractCostParamEntry[];
export const ContractCostParams = xdr.array(
  xdr.lazy(() => ContractCostParamEntry),
  1024,
) as xdr.XdrType<ContractCostParams>;
