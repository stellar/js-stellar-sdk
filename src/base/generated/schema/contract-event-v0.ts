// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface ContractEventV0 {
  readonly topics: SCVal[];
  readonly data: SCVal;
}
export const ContractEventV0 = xdr.struct("ContractEventV0", {
  topics: xdr.array(
    xdr.lazy(() => SCVal),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  data: xdr.lazy(() => SCVal),
}) as xdr.XdrType<ContractEventV0>;
