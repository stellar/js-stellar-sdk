// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEvent } from "./contract-event.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface InvokeHostFunctionSuccessPreImage {
  readonly returnValue: SCVal;
  readonly events: ContractEvent[];
}
export const InvokeHostFunctionSuccessPreImage = xdr.struct(
  "InvokeHostFunctionSuccessPreImage",
  {
    returnValue: xdr.lazy(() => SCVal),
    events: xdr.array(
      xdr.lazy(() => ContractEvent),
      xdr.UNBOUNDED_MAX_LENGTH,
    ),
  },
) as xdr.XdrType<InvokeHostFunctionSuccessPreImage>;
