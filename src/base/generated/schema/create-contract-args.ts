// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractExecutable } from "./contract-executable.js";
import { ContractIdPreimage } from "./contract-id-preimage.js";
export interface CreateContractArgs {
  readonly contractIdPreimage: ContractIdPreimage;
  readonly executable: ContractExecutable;
}
export const CreateContractArgs = xdr.struct("CreateContractArgs", {
  contractIdPreimage: xdr.lazy(() => ContractIdPreimage),
  executable: xdr.lazy(() => ContractExecutable),
}) as xdr.XdrType<CreateContractArgs>;
