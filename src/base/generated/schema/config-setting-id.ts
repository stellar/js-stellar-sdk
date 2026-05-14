// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ConfigSettingId = xdr.enumType("ConfigSettingID", {
  configSettingContractMaxSizeBytes: 0,
  configSettingContractComputeV0: 1,
  configSettingContractLedgerCostV0: 2,
  configSettingContractHistoricalDataV0: 3,
  configSettingContractEventsV0: 4,
  configSettingContractBandwidthV0: 5,
  configSettingContractCostParamsCpuInstructions: 6,
  configSettingContractCostParamsMemoryBytes: 7,
  configSettingContractDataKeySizeBytes: 8,
  configSettingContractDataEntrySizeBytes: 9,
  configSettingStateArchival: 10,
  configSettingContractExecutionLanes: 11,
  configSettingLiveSorobanStateSizeWindow: 12,
  configSettingEvictionIterator: 13,
  configSettingContractParallelComputeV0: 14,
  configSettingContractLedgerCostExtV0: 15,
  configSettingScpTiming: 16,
  configSettingFrozenLedgerKeys: 17,
  configSettingFrozenLedgerKeysDelta: 18,
  configSettingFreezeBypassTxs: 19,
  configSettingFreezeBypassTxsDelta: 20,
} as const);
export type ConfigSettingId = xdr.Infer<typeof ConfigSettingId>;
