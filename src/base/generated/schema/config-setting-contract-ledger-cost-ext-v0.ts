// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractLedgerCostExtV0 {
  readonly txMaxFootprintEntries: number;
  readonly feeWrite1KB: bigint;
}
export const ConfigSettingContractLedgerCostExtV0 = xdr.struct(
  "ConfigSettingContractLedgerCostExtV0",
  {
    txMaxFootprintEntries: xdr.uint32(),
    feeWrite1KB: xdr.int64(),
  },
) as xdr.XdrType<ConfigSettingContractLedgerCostExtV0>;
