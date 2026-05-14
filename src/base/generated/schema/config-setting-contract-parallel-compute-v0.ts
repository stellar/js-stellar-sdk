// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractParallelComputeV0 {
  readonly ledgerMaxDependentTxClusters: number;
}
export const ConfigSettingContractParallelComputeV0 = xdr.struct(
  "ConfigSettingContractParallelComputeV0",
  {
    ledgerMaxDependentTxClusters: xdr.uint32(),
  },
) as xdr.XdrType<ConfigSettingContractParallelComputeV0>;
