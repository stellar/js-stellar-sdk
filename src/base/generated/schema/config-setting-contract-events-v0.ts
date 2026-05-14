// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractEventsV0 {
  readonly txMaxContractEventsSizeBytes: number;
  readonly feeContractEvents1KB: bigint;
}
export const ConfigSettingContractEventsV0 = xdr.struct(
  "ConfigSettingContractEventsV0",
  {
    txMaxContractEventsSizeBytes: xdr.uint32(),
    feeContractEvents1KB: xdr.int64(),
  },
) as xdr.XdrType<ConfigSettingContractEventsV0>;
