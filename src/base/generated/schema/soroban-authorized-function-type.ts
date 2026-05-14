// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SorobanAuthorizedFunctionType = xdr.enumType(
  "SorobanAuthorizedFunctionType",
  {
    sorobanAuthorizedFunctionTypeContractFn: 0,
    sorobanAuthorizedFunctionTypeCreateContractHostFn: 1,
    sorobanAuthorizedFunctionTypeCreateContractV2HostFn: 2,
  } as const,
);
export type SorobanAuthorizedFunctionType = xdr.Infer<
  typeof SorobanAuthorizedFunctionType
>;
