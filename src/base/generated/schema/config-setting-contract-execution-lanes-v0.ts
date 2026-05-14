// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractExecutionLanesV0 {
  readonly ledgerMaxTxCount: number;
}
export const ConfigSettingContractExecutionLanesV0 = xdr.struct(
  "ConfigSettingContractExecutionLanesV0",
  {
    ledgerMaxTxCount: xdr.uint32(),
  },
) as xdr.XdrType<ConfigSettingContractExecutionLanesV0>;
