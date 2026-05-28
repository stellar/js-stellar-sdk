import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ConfigSettingIdWire = number;

export type ConfigSettingIdName =
  | "configSettingContractMaxSizeBytes"
  | "configSettingContractComputeV0"
  | "configSettingContractLedgerCostV0"
  | "configSettingContractHistoricalDataV0"
  | "configSettingContractEventsV0"
  | "configSettingContractBandwidthV0"
  | "configSettingContractCostParamsCpuInstructions"
  | "configSettingContractCostParamsMemoryBytes"
  | "configSettingContractDataKeySizeBytes"
  | "configSettingContractDataEntrySizeBytes"
  | "configSettingStateArchival"
  | "configSettingContractExecutionLanes"
  | "configSettingLiveSorobanStateSizeWindow"
  | "configSettingEvictionIterator"
  | "configSettingContractParallelComputeV0"
  | "configSettingContractLedgerCostExtV0"
  | "configSettingScpTiming"
  | "configSettingFrozenLedgerKeys"
  | "configSettingFrozenLedgerKeysDelta"
  | "configSettingFreezeBypassTxs"
  | "configSettingFreezeBypassTxsDelta";

/**
 * ```xdr
 * enum ConfigSettingID
 * {
 *     CONFIG_SETTING_CONTRACT_MAX_SIZE_BYTES = 0,
 *     CONFIG_SETTING_CONTRACT_COMPUTE_V0 = 1,
 *     CONFIG_SETTING_CONTRACT_LEDGER_COST_V0 = 2,
 *     CONFIG_SETTING_CONTRACT_HISTORICAL_DATA_V0 = 3,
 *     CONFIG_SETTING_CONTRACT_EVENTS_V0 = 4,
 *     CONFIG_SETTING_CONTRACT_BANDWIDTH_V0 = 5,
 *     CONFIG_SETTING_CONTRACT_COST_PARAMS_CPU_INSTRUCTIONS = 6,
 *     CONFIG_SETTING_CONTRACT_COST_PARAMS_MEMORY_BYTES = 7,
 *     CONFIG_SETTING_CONTRACT_DATA_KEY_SIZE_BYTES = 8,
 *     CONFIG_SETTING_CONTRACT_DATA_ENTRY_SIZE_BYTES = 9,
 *     CONFIG_SETTING_STATE_ARCHIVAL = 10,
 *     CONFIG_SETTING_CONTRACT_EXECUTION_LANES = 11,
 *     CONFIG_SETTING_LIVE_SOROBAN_STATE_SIZE_WINDOW = 12,
 *     CONFIG_SETTING_EVICTION_ITERATOR = 13,
 *     CONFIG_SETTING_CONTRACT_PARALLEL_COMPUTE_V0 = 14,
 *     CONFIG_SETTING_CONTRACT_LEDGER_COST_EXT_V0 = 15,
 *     CONFIG_SETTING_SCP_TIMING = 16,
 *     CONFIG_SETTING_FROZEN_LEDGER_KEYS = 17,
 *     CONFIG_SETTING_FROZEN_LEDGER_KEYS_DELTA = 18,
 *     CONFIG_SETTING_FREEZE_BYPASS_TXS = 19,
 *     CONFIG_SETTING_FREEZE_BYPASS_TXS_DELTA = 20
 * };
 * ```
 */
export class ConfigSettingId extends EnumValue<ConfigSettingIdName> {
  static readonly configSettingContractMaxSizeBytes = new ConfigSettingId(
    "configSettingContractMaxSizeBytes",
    0,
  );
  static readonly configSettingContractComputeV0 = new ConfigSettingId(
    "configSettingContractComputeV0",
    1,
  );
  static readonly configSettingContractLedgerCostV0 = new ConfigSettingId(
    "configSettingContractLedgerCostV0",
    2,
  );
  static readonly configSettingContractHistoricalDataV0 = new ConfigSettingId(
    "configSettingContractHistoricalDataV0",
    3,
  );
  static readonly configSettingContractEventsV0 = new ConfigSettingId(
    "configSettingContractEventsV0",
    4,
  );
  static readonly configSettingContractBandwidthV0 = new ConfigSettingId(
    "configSettingContractBandwidthV0",
    5,
  );
  static readonly configSettingContractCostParamsCpuInstructions =
    new ConfigSettingId("configSettingContractCostParamsCpuInstructions", 6);
  static readonly configSettingContractCostParamsMemoryBytes =
    new ConfigSettingId("configSettingContractCostParamsMemoryBytes", 7);
  static readonly configSettingContractDataKeySizeBytes = new ConfigSettingId(
    "configSettingContractDataKeySizeBytes",
    8,
  );
  static readonly configSettingContractDataEntrySizeBytes = new ConfigSettingId(
    "configSettingContractDataEntrySizeBytes",
    9,
  );
  static readonly configSettingStateArchival = new ConfigSettingId(
    "configSettingStateArchival",
    10,
  );
  static readonly configSettingContractExecutionLanes = new ConfigSettingId(
    "configSettingContractExecutionLanes",
    11,
  );
  static readonly configSettingLiveSorobanStateSizeWindow = new ConfigSettingId(
    "configSettingLiveSorobanStateSizeWindow",
    12,
  );
  static readonly configSettingEvictionIterator = new ConfigSettingId(
    "configSettingEvictionIterator",
    13,
  );
  static readonly configSettingContractParallelComputeV0 = new ConfigSettingId(
    "configSettingContractParallelComputeV0",
    14,
  );
  static readonly configSettingContractLedgerCostExtV0 = new ConfigSettingId(
    "configSettingContractLedgerCostExtV0",
    15,
  );
  static readonly configSettingScpTiming = new ConfigSettingId(
    "configSettingScpTiming",
    16,
  );
  static readonly configSettingFrozenLedgerKeys = new ConfigSettingId(
    "configSettingFrozenLedgerKeys",
    17,
  );
  static readonly configSettingFrozenLedgerKeysDelta = new ConfigSettingId(
    "configSettingFrozenLedgerKeysDelta",
    18,
  );
  static readonly configSettingFreezeBypassTxs = new ConfigSettingId(
    "configSettingFreezeBypassTxs",
    19,
  );
  static readonly configSettingFreezeBypassTxsDelta = new ConfigSettingId(
    "configSettingFreezeBypassTxsDelta",
    20,
  );

  static readonly schema = enumType("ConfigSettingId", {
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
  });

  static fromValue(value: number): ConfigSettingId {
    return enumFromValue(
      "ConfigSettingId",
      ConfigSettingId.schema,
      ConfigSettingId,
      value,
    );
  }

  static fromName(name: ConfigSettingIdName): ConfigSettingId {
    return enumFromName("ConfigSettingId", ConfigSettingId, name);
  }

  static fromXdrObject(wire: number): ConfigSettingId {
    return ConfigSettingId.fromValue(wire);
  }
}
