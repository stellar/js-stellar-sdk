// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCAddress } from "./sc-address.js";
import { uint256 } from "./uint256.js";
export interface ContractIdPreimageFromAddress {
  readonly address: SCAddress;
  readonly salt: uint256;
}
export const ContractIdPreimageFromAddress = xdr.struct(
  "ContractIDPreimageFromAddress",
  {
    address: xdr.lazy(() => SCAddress),
    salt: xdr.lazy(() => uint256),
  },
) as xdr.XdrType<ContractIdPreimageFromAddress>;
