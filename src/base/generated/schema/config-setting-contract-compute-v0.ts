// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractComputeV0 {
  readonly ledgerMaxInstructions: bigint;
  readonly txMaxInstructions: bigint;
  readonly feeRatePerInstructionsIncrement: bigint;
  readonly txMemoryLimit: number;
}
export const ConfigSettingContractComputeV0 = xdr.struct(
  "ConfigSettingContractComputeV0",
  {
    ledgerMaxInstructions: xdr.int64(),
    txMaxInstructions: xdr.int64(),
    feeRatePerInstructionsIncrement: xdr.int64(),
    txMemoryLimit: xdr.uint32(),
  },
) as xdr.XdrType<ConfigSettingContractComputeV0>;
