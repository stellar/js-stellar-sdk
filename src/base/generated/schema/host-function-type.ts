// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const HostFunctionType = xdr.enumType("HostFunctionType", {
  hostFunctionTypeInvokeContract: 0,
  hostFunctionTypeCreateContract: 1,
  hostFunctionTypeUploadContractWasm: 2,
  hostFunctionTypeCreateContractV2: 3,
} as const);
export type HostFunctionType = xdr.Infer<typeof HostFunctionType>;
