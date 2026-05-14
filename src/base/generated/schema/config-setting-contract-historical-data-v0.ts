// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractHistoricalDataV0 {
  readonly feeHistorical1KB: bigint;
}
export const ConfigSettingContractHistoricalDataV0 = xdr.struct(
  "ConfigSettingContractHistoricalDataV0",
  {
    feeHistorical1KB: xdr.int64(),
  },
) as xdr.XdrType<ConfigSettingContractHistoricalDataV0>;
