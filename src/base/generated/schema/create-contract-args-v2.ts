// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractExecutable } from "./contract-executable.js";
import { ContractIdPreimage } from "./contract-id-preimage.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface CreateContractArgsV2 {
  readonly contractIdPreimage: ContractIdPreimage;
  readonly executable: ContractExecutable;
  readonly constructorArgs: SCVal[];
}
export const CreateContractArgsV2 = xdr.struct("CreateContractArgsV2", {
  contractIdPreimage: xdr.lazy(() => ContractIdPreimage),
  executable: xdr.lazy(() => ContractExecutable),
  constructorArgs: xdr.array(
    xdr.lazy(() => SCVal),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<CreateContractArgsV2>;
