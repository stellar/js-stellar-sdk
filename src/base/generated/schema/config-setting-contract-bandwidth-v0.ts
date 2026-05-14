// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractBandwidthV0 {
  readonly ledgerMaxTxsSizeBytes: number;
  readonly txMaxSizeBytes: number;
  readonly feeTxSize1KB: bigint;
}
export const ConfigSettingContractBandwidthV0 = xdr.struct(
  "ConfigSettingContractBandwidthV0",
  {
    ledgerMaxTxsSizeBytes: xdr.uint32(),
    txMaxSizeBytes: xdr.uint32(),
    feeTxSize1KB: xdr.int64(),
  },
) as xdr.XdrType<ConfigSettingContractBandwidthV0>;
