// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractIdPreimage } from "./contract-id-preimage.js";
import { Hash } from "./hash.js";
export interface HashIdPreimageContractId {
  readonly networkId: Hash;
  readonly contractIdPreimage: ContractIdPreimage;
}
export const HashIdPreimageContractId = xdr.struct("HashIDPreimageContractId", {
  networkId: xdr.lazy(() => Hash),
  contractIdPreimage: xdr.lazy(() => ContractIdPreimage),
}) as xdr.XdrType<HashIdPreimageContractId>;
