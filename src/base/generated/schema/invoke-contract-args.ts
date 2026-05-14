// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCAddress } from "./sc-address.js";
import { SCSymbol } from "./sc-symbol.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface InvokeContractArgs {
  readonly contractAddress: SCAddress;
  readonly functionName: SCSymbol;
  readonly args: SCVal[];
}
export const InvokeContractArgs = xdr.struct("InvokeContractArgs", {
  contractAddress: xdr.lazy(() => SCAddress),
  functionName: xdr.lazy(() => SCSymbol),
  args: xdr.array(
    xdr.lazy(() => SCVal),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<InvokeContractArgs>;
