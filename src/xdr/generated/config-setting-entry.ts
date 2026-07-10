/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import {
  array,
  case as case_,
  field,
  uint32,
  uint64,
  union,
} from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ConfigSettingId } from "./config-setting-id.js";
import {
  ConfigSettingContractComputeV0,
  type ConfigSettingContractComputeV0Wire,
} from "./config-setting-contract-compute-v0.js";
import {
  ConfigSettingContractLedgerCostV0,
  type ConfigSettingContractLedgerCostV0Wire,
} from "./config-setting-contract-ledger-cost-v0.js";
import {
  ConfigSettingContractHistoricalDataV0,
  type ConfigSettingContractHistoricalDataV0Wire,
} from "./config-setting-contract-historical-data-v0.js";
import {
  ConfigSettingContractEventsV0,
  type ConfigSettingContractEventsV0Wire,
} from "./config-setting-contract-events-v0.js";
import {
  ConfigSettingContractBandwidthV0,
  type ConfigSettingContractBandwidthV0Wire,
} from "./config-setting-contract-bandwidth-v0.js";
import {
  ContractCostParamEntry,
  type ContractCostParamEntryWire,
} from "./contract-cost-param-entry.js";
import {
  StateArchivalSettings,
  type StateArchivalSettingsWire,
} from "./state-archival-settings.js";
import {
  ConfigSettingContractExecutionLanesV0,
  type ConfigSettingContractExecutionLanesV0Wire,
} from "./config-setting-contract-execution-lanes-v0.js";
import {
  EvictionIterator,
  type EvictionIteratorWire,
} from "./eviction-iterator.js";
import {
  ConfigSettingContractParallelComputeV0,
  type ConfigSettingContractParallelComputeV0Wire,
} from "./config-setting-contract-parallel-compute-v0.js";
import {
  ConfigSettingContractLedgerCostExtV0,
  type ConfigSettingContractLedgerCostExtV0Wire,
} from "./config-setting-contract-ledger-cost-ext-v0.js";
import {
  ConfigSettingScpTiming,
  type ConfigSettingScpTimingWire,
} from "./config-setting-scp-timing.js";
import {
  FrozenLedgerKeys,
  type FrozenLedgerKeysWire,
} from "./frozen-ledger-keys.js";
import {
  FrozenLedgerKeysDelta,
  type FrozenLedgerKeysDeltaWire,
} from "./frozen-ledger-keys-delta.js";
import {
  FreezeBypassTxs,
  type FreezeBypassTxsWire,
} from "./freeze-bypass-txs.js";
import {
  FreezeBypassTxsDelta,
  type FreezeBypassTxsDeltaWire,
} from "./freeze-bypass-txs-delta.js";

export type ConfigSettingEntryWire =
  | { configSettingID: 0; contractMaxSizeBytes: number }
  | { configSettingID: 1; contractCompute: ConfigSettingContractComputeV0Wire }
  | {
      configSettingID: 2;
      contractLedgerCost: ConfigSettingContractLedgerCostV0Wire;
    }
  | {
      configSettingID: 3;
      contractHistoricalData: ConfigSettingContractHistoricalDataV0Wire;
    }
  | { configSettingID: 4; contractEvents: ConfigSettingContractEventsV0Wire }
  | {
      configSettingID: 5;
      contractBandwidth: ConfigSettingContractBandwidthV0Wire;
    }
  | {
      configSettingID: 6;
      contractCostParamsCpuInsns: ContractCostParamEntryWire[];
    }
  | {
      configSettingID: 7;
      contractCostParamsMemBytes: ContractCostParamEntryWire[];
    }
  | { configSettingID: 8; contractDataKeySizeBytes: number }
  | { configSettingID: 9; contractDataEntrySizeBytes: number }
  | { configSettingID: 10; stateArchivalSettings: StateArchivalSettingsWire }
  | {
      configSettingID: 11;
      contractExecutionLanes: ConfigSettingContractExecutionLanesV0Wire;
    }
  | { configSettingID: 12; liveSorobanStateSizeWindow: bigint[] }
  | { configSettingID: 13; evictionIterator: EvictionIteratorWire }
  | {
      configSettingID: 14;
      contractParallelCompute: ConfigSettingContractParallelComputeV0Wire;
    }
  | {
      configSettingID: 15;
      contractLedgerCostExt: ConfigSettingContractLedgerCostExtV0Wire;
    }
  | { configSettingID: 16; contractScpTiming: ConfigSettingScpTimingWire }
  | { configSettingID: 17; frozenLedgerKeys: FrozenLedgerKeysWire }
  | { configSettingID: 18; frozenLedgerKeysDelta: FrozenLedgerKeysDeltaWire }
  | { configSettingID: 19; freezeBypassTxs: FreezeBypassTxsWire }
  | { configSettingID: 20; freezeBypassTxsDelta: FreezeBypassTxsDeltaWire };

export type ConfigSettingEntryVariantName =
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
 * union ConfigSettingEntry switch (ConfigSettingID configSettingID)
 * {
 * case CONFIG_SETTING_CONTRACT_MAX_SIZE_BYTES:
 *     uint32 contractMaxSizeBytes;
 * case CONFIG_SETTING_CONTRACT_COMPUTE_V0:
 *     ConfigSettingContractComputeV0 contractCompute;
 * case CONFIG_SETTING_CONTRACT_LEDGER_COST_V0:
 *     ConfigSettingContractLedgerCostV0 contractLedgerCost;
 * case CONFIG_SETTING_CONTRACT_HISTORICAL_DATA_V0:
 *     ConfigSettingContractHistoricalDataV0 contractHistoricalData;
 * case CONFIG_SETTING_CONTRACT_EVENTS_V0:
 *     ConfigSettingContractEventsV0 contractEvents;
 * case CONFIG_SETTING_CONTRACT_BANDWIDTH_V0:
 *     ConfigSettingContractBandwidthV0 contractBandwidth;
 * case CONFIG_SETTING_CONTRACT_COST_PARAMS_CPU_INSTRUCTIONS:
 *     ContractCostParams contractCostParamsCpuInsns;
 * case CONFIG_SETTING_CONTRACT_COST_PARAMS_MEMORY_BYTES:
 *     ContractCostParams contractCostParamsMemBytes;
 * case CONFIG_SETTING_CONTRACT_DATA_KEY_SIZE_BYTES:
 *     uint32 contractDataKeySizeBytes;
 * case CONFIG_SETTING_CONTRACT_DATA_ENTRY_SIZE_BYTES:
 *     uint32 contractDataEntrySizeBytes;
 * case CONFIG_SETTING_STATE_ARCHIVAL:
 *     StateArchivalSettings stateArchivalSettings;
 * case CONFIG_SETTING_CONTRACT_EXECUTION_LANES:
 *     ConfigSettingContractExecutionLanesV0 contractExecutionLanes;
 * case CONFIG_SETTING_LIVE_SOROBAN_STATE_SIZE_WINDOW:
 *     uint64 liveSorobanStateSizeWindow<>;
 * case CONFIG_SETTING_EVICTION_ITERATOR:
 *     EvictionIterator evictionIterator;
 * case CONFIG_SETTING_CONTRACT_PARALLEL_COMPUTE_V0:
 *     ConfigSettingContractParallelComputeV0 contractParallelCompute;
 * case CONFIG_SETTING_CONTRACT_LEDGER_COST_EXT_V0:
 *     ConfigSettingContractLedgerCostExtV0 contractLedgerCostExt;
 * case CONFIG_SETTING_SCP_TIMING:
 *     ConfigSettingSCPTiming contractSCPTiming;
 * case CONFIG_SETTING_FROZEN_LEDGER_KEYS:
 *     FrozenLedgerKeys frozenLedgerKeys;
 * case CONFIG_SETTING_FROZEN_LEDGER_KEYS_DELTA:
 *     FrozenLedgerKeysDelta frozenLedgerKeysDelta;
 * case CONFIG_SETTING_FREEZE_BYPASS_TXS:
 *     FreezeBypassTxs freezeBypassTxs;
 * case CONFIG_SETTING_FREEZE_BYPASS_TXS_DELTA:
 *     FreezeBypassTxsDelta freezeBypassTxsDelta;
 * };
 * ```
 */
abstract class ConfigSettingEntryBase extends XdrValue {
  abstract readonly type: ConfigSettingEntryVariantName;

  static readonly schema: XdrType<ConfigSettingEntryWire> = union(
    "ConfigSettingEntry",
    {
      switchOn: ConfigSettingId.schema,
      cases: [
        case_(
          "configSettingContractMaxSizeBytes",
          0,
          field("contractMaxSizeBytes", uint32()),
        ),
        case_(
          "configSettingContractComputeV0",
          1,
          field("contractCompute", ConfigSettingContractComputeV0.schema),
        ),
        case_(
          "configSettingContractLedgerCostV0",
          2,
          field("contractLedgerCost", ConfigSettingContractLedgerCostV0.schema),
        ),
        case_(
          "configSettingContractHistoricalDataV0",
          3,
          field(
            "contractHistoricalData",
            ConfigSettingContractHistoricalDataV0.schema,
          ),
        ),
        case_(
          "configSettingContractEventsV0",
          4,
          field("contractEvents", ConfigSettingContractEventsV0.schema),
        ),
        case_(
          "configSettingContractBandwidthV0",
          5,
          field("contractBandwidth", ConfigSettingContractBandwidthV0.schema),
        ),
        case_(
          "configSettingContractCostParamsCpuInstructions",
          6,
          field(
            "contractCostParamsCpuInsns",
            array(ContractCostParamEntry.schema, UNBOUNDED_MAX_LENGTH),
          ),
        ),
        case_(
          "configSettingContractCostParamsMemoryBytes",
          7,
          field(
            "contractCostParamsMemBytes",
            array(ContractCostParamEntry.schema, UNBOUNDED_MAX_LENGTH),
          ),
        ),
        case_(
          "configSettingContractDataKeySizeBytes",
          8,
          field("contractDataKeySizeBytes", uint32()),
        ),
        case_(
          "configSettingContractDataEntrySizeBytes",
          9,
          field("contractDataEntrySizeBytes", uint32()),
        ),
        case_(
          "configSettingStateArchival",
          10,
          field("stateArchivalSettings", StateArchivalSettings.schema),
        ),
        case_(
          "configSettingContractExecutionLanes",
          11,
          field(
            "contractExecutionLanes",
            ConfigSettingContractExecutionLanesV0.schema,
          ),
        ),
        case_(
          "configSettingLiveSorobanStateSizeWindow",
          12,
          field(
            "liveSorobanStateSizeWindow",
            array(uint64(), UNBOUNDED_MAX_LENGTH),
          ),
        ),
        case_(
          "configSettingEvictionIterator",
          13,
          field("evictionIterator", EvictionIterator.schema),
        ),
        case_(
          "configSettingContractParallelComputeV0",
          14,
          field(
            "contractParallelCompute",
            ConfigSettingContractParallelComputeV0.schema,
          ),
        ),
        case_(
          "configSettingContractLedgerCostExtV0",
          15,
          field(
            "contractLedgerCostExt",
            ConfigSettingContractLedgerCostExtV0.schema,
          ),
        ),
        case_(
          "configSettingScpTiming",
          16,
          field("contractScpTiming", ConfigSettingScpTiming.schema),
        ),
        case_(
          "configSettingFrozenLedgerKeys",
          17,
          field("frozenLedgerKeys", FrozenLedgerKeys.schema),
        ),
        case_(
          "configSettingFrozenLedgerKeysDelta",
          18,
          field("frozenLedgerKeysDelta", FrozenLedgerKeysDelta.schema),
        ),
        case_(
          "configSettingFreezeBypassTxs",
          19,
          field("freezeBypassTxs", FreezeBypassTxs.schema),
        ),
        case_(
          "configSettingFreezeBypassTxsDelta",
          20,
          field("freezeBypassTxsDelta", FreezeBypassTxsDelta.schema),
        ),
      ],
      switchKey: "configSettingID",
    },
  );

  static configSettingContractMaxSizeBytes(
    contractMaxSizeBytes: number,
  ): ConfigSettingEntryContractMaxSizeBytes {
    return new ConfigSettingEntryContractMaxSizeBytes(contractMaxSizeBytes);
  }

  static configSettingContractComputeV0(
    contractCompute: ConfigSettingContractComputeV0,
  ): ConfigSettingEntryContractComputeV0 {
    return new ConfigSettingEntryContractComputeV0(contractCompute);
  }

  static configSettingContractLedgerCostV0(
    contractLedgerCost: ConfigSettingContractLedgerCostV0,
  ): ConfigSettingEntryContractLedgerCostV0 {
    return new ConfigSettingEntryContractLedgerCostV0(contractLedgerCost);
  }

  static configSettingContractHistoricalDataV0(
    contractHistoricalData: ConfigSettingContractHistoricalDataV0,
  ): ConfigSettingEntryContractHistoricalDataV0 {
    return new ConfigSettingEntryContractHistoricalDataV0(
      contractHistoricalData,
    );
  }

  static configSettingContractEventsV0(
    contractEvents: ConfigSettingContractEventsV0,
  ): ConfigSettingEntryContractEventsV0 {
    return new ConfigSettingEntryContractEventsV0(contractEvents);
  }

  static configSettingContractBandwidthV0(
    contractBandwidth: ConfigSettingContractBandwidthV0,
  ): ConfigSettingEntryContractBandwidthV0 {
    return new ConfigSettingEntryContractBandwidthV0(contractBandwidth);
  }

  static configSettingContractCostParamsCpuInstructions(
    contractCostParamsCpuInsns: ContractCostParamEntry[],
  ): ConfigSettingEntryContractCostParamsCpuInstructions {
    return new ConfigSettingEntryContractCostParamsCpuInstructions(
      contractCostParamsCpuInsns,
    );
  }

  static configSettingContractCostParamsMemoryBytes(
    contractCostParamsMemBytes: ContractCostParamEntry[],
  ): ConfigSettingEntryContractCostParamsMemoryBytes {
    return new ConfigSettingEntryContractCostParamsMemoryBytes(
      contractCostParamsMemBytes,
    );
  }

  static configSettingContractDataKeySizeBytes(
    contractDataKeySizeBytes: number,
  ): ConfigSettingEntryContractDataKeySizeBytes {
    return new ConfigSettingEntryContractDataKeySizeBytes(
      contractDataKeySizeBytes,
    );
  }

  static configSettingContractDataEntrySizeBytes(
    contractDataEntrySizeBytes: number,
  ): ConfigSettingEntryContractDataEntrySizeBytes {
    return new ConfigSettingEntryContractDataEntrySizeBytes(
      contractDataEntrySizeBytes,
    );
  }

  static configSettingStateArchival(
    stateArchivalSettings: StateArchivalSettings,
  ): ConfigSettingEntryStateArchival {
    return new ConfigSettingEntryStateArchival(stateArchivalSettings);
  }

  static configSettingContractExecutionLanes(
    contractExecutionLanes: ConfigSettingContractExecutionLanesV0,
  ): ConfigSettingEntryContractExecutionLanes {
    return new ConfigSettingEntryContractExecutionLanes(contractExecutionLanes);
  }

  static configSettingLiveSorobanStateSizeWindow(
    liveSorobanStateSizeWindow: bigint[],
  ): ConfigSettingEntryLiveSorobanStateSizeWindow {
    return new ConfigSettingEntryLiveSorobanStateSizeWindow(
      liveSorobanStateSizeWindow,
    );
  }

  static configSettingEvictionIterator(
    evictionIterator: EvictionIterator,
  ): ConfigSettingEntryEvictionIterator {
    return new ConfigSettingEntryEvictionIterator(evictionIterator);
  }

  static configSettingContractParallelComputeV0(
    contractParallelCompute: ConfigSettingContractParallelComputeV0,
  ): ConfigSettingEntryContractParallelComputeV0 {
    return new ConfigSettingEntryContractParallelComputeV0(
      contractParallelCompute,
    );
  }

  static configSettingContractLedgerCostExtV0(
    contractLedgerCostExt: ConfigSettingContractLedgerCostExtV0,
  ): ConfigSettingEntryContractLedgerCostExtV0 {
    return new ConfigSettingEntryContractLedgerCostExtV0(contractLedgerCostExt);
  }

  static configSettingScpTiming(
    contractScpTiming: ConfigSettingScpTiming,
  ): ConfigSettingEntryScpTiming {
    return new ConfigSettingEntryScpTiming(contractScpTiming);
  }

  static configSettingFrozenLedgerKeys(
    frozenLedgerKeys: FrozenLedgerKeys,
  ): ConfigSettingEntryFrozenLedgerKeys {
    return new ConfigSettingEntryFrozenLedgerKeys(frozenLedgerKeys);
  }

  static configSettingFrozenLedgerKeysDelta(
    frozenLedgerKeysDelta: FrozenLedgerKeysDelta,
  ): ConfigSettingEntryFrozenLedgerKeysDelta {
    return new ConfigSettingEntryFrozenLedgerKeysDelta(frozenLedgerKeysDelta);
  }

  static configSettingFreezeBypassTxs(
    freezeBypassTxs: FreezeBypassTxs,
  ): ConfigSettingEntryFreezeBypassTxs {
    return new ConfigSettingEntryFreezeBypassTxs(freezeBypassTxs);
  }

  static configSettingFreezeBypassTxsDelta(
    freezeBypassTxsDelta: FreezeBypassTxsDelta,
  ): ConfigSettingEntryFreezeBypassTxsDelta {
    return new ConfigSettingEntryFreezeBypassTxsDelta(freezeBypassTxsDelta);
  }

  static fromXdrObject(wire: ConfigSettingEntryWire): ConfigSettingEntry {
    switch (wire.configSettingID) {
      case 0:
        return new ConfigSettingEntryContractMaxSizeBytes(
          wire.contractMaxSizeBytes,
        );
      case 1:
        return new ConfigSettingEntryContractComputeV0(
          ConfigSettingContractComputeV0.fromXdrObject(wire.contractCompute),
        );
      case 2:
        return new ConfigSettingEntryContractLedgerCostV0(
          ConfigSettingContractLedgerCostV0.fromXdrObject(
            wire.contractLedgerCost,
          ),
        );
      case 3:
        return new ConfigSettingEntryContractHistoricalDataV0(
          ConfigSettingContractHistoricalDataV0.fromXdrObject(
            wire.contractHistoricalData,
          ),
        );
      case 4:
        return new ConfigSettingEntryContractEventsV0(
          ConfigSettingContractEventsV0.fromXdrObject(wire.contractEvents),
        );
      case 5:
        return new ConfigSettingEntryContractBandwidthV0(
          ConfigSettingContractBandwidthV0.fromXdrObject(
            wire.contractBandwidth,
          ),
        );
      case 6:
        return new ConfigSettingEntryContractCostParamsCpuInstructions(
          wire.contractCostParamsCpuInsns.map((w) =>
            ContractCostParamEntry.fromXdrObject(w),
          ),
        );
      case 7:
        return new ConfigSettingEntryContractCostParamsMemoryBytes(
          wire.contractCostParamsMemBytes.map((w) =>
            ContractCostParamEntry.fromXdrObject(w),
          ),
        );
      case 8:
        return new ConfigSettingEntryContractDataKeySizeBytes(
          wire.contractDataKeySizeBytes,
        );
      case 9:
        return new ConfigSettingEntryContractDataEntrySizeBytes(
          wire.contractDataEntrySizeBytes,
        );
      case 10:
        return new ConfigSettingEntryStateArchival(
          StateArchivalSettings.fromXdrObject(wire.stateArchivalSettings),
        );
      case 11:
        return new ConfigSettingEntryContractExecutionLanes(
          ConfigSettingContractExecutionLanesV0.fromXdrObject(
            wire.contractExecutionLanes,
          ),
        );
      case 12:
        return new ConfigSettingEntryLiveSorobanStateSizeWindow(
          wire.liveSorobanStateSizeWindow,
        );
      case 13:
        return new ConfigSettingEntryEvictionIterator(
          EvictionIterator.fromXdrObject(wire.evictionIterator),
        );
      case 14:
        return new ConfigSettingEntryContractParallelComputeV0(
          ConfigSettingContractParallelComputeV0.fromXdrObject(
            wire.contractParallelCompute,
          ),
        );
      case 15:
        return new ConfigSettingEntryContractLedgerCostExtV0(
          ConfigSettingContractLedgerCostExtV0.fromXdrObject(
            wire.contractLedgerCostExt,
          ),
        );
      case 16:
        return new ConfigSettingEntryScpTiming(
          ConfigSettingScpTiming.fromXdrObject(wire.contractScpTiming),
        );
      case 17:
        return new ConfigSettingEntryFrozenLedgerKeys(
          FrozenLedgerKeys.fromXdrObject(wire.frozenLedgerKeys),
        );
      case 18:
        return new ConfigSettingEntryFrozenLedgerKeysDelta(
          FrozenLedgerKeysDelta.fromXdrObject(wire.frozenLedgerKeysDelta),
        );
      case 19:
        return new ConfigSettingEntryFreezeBypassTxs(
          FreezeBypassTxs.fromXdrObject(wire.freezeBypassTxs),
        );
      case 20:
        return new ConfigSettingEntryFreezeBypassTxsDelta(
          FreezeBypassTxsDelta.fromXdrObject(wire.freezeBypassTxsDelta),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ConfigSettingEntry variant.
   * Use this instead of `instanceof ConfigSettingEntry`: the exported `ConfigSettingEntry` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ConfigSettingEntry.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ConfigSettingEntry {
    return value instanceof ConfigSettingEntryBase;
  }

  abstract toXdrObject(): ConfigSettingEntryWire;
}

export class ConfigSettingEntryContractMaxSizeBytes extends ConfigSettingEntryBase {
  readonly type = "configSettingContractMaxSizeBytes" as const;
  readonly contractMaxSizeBytes: number;

  constructor(contractMaxSizeBytes: number) {
    super();
    this.contractMaxSizeBytes = contractMaxSizeBytes;
  }

  get value(): number {
    return this.contractMaxSizeBytes;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 0 }> {
    return {
      configSettingID: 0,
      contractMaxSizeBytes: this.contractMaxSizeBytes,
    };
  }
}

export class ConfigSettingEntryContractComputeV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractComputeV0" as const;
  readonly contractCompute: ConfigSettingContractComputeV0;

  constructor(contractCompute: ConfigSettingContractComputeV0) {
    super();
    this.contractCompute = contractCompute;
  }

  get value(): ConfigSettingContractComputeV0 {
    return this.contractCompute;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 1 }> {
    return {
      configSettingID: 1,
      contractCompute: this.contractCompute.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractLedgerCostV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractLedgerCostV0" as const;
  readonly contractLedgerCost: ConfigSettingContractLedgerCostV0;

  constructor(contractLedgerCost: ConfigSettingContractLedgerCostV0) {
    super();
    this.contractLedgerCost = contractLedgerCost;
  }

  get value(): ConfigSettingContractLedgerCostV0 {
    return this.contractLedgerCost;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 2 }> {
    return {
      configSettingID: 2,
      contractLedgerCost: this.contractLedgerCost.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractHistoricalDataV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractHistoricalDataV0" as const;
  readonly contractHistoricalData: ConfigSettingContractHistoricalDataV0;

  constructor(contractHistoricalData: ConfigSettingContractHistoricalDataV0) {
    super();
    this.contractHistoricalData = contractHistoricalData;
  }

  get value(): ConfigSettingContractHistoricalDataV0 {
    return this.contractHistoricalData;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 3 }> {
    return {
      configSettingID: 3,
      contractHistoricalData: this.contractHistoricalData.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractEventsV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractEventsV0" as const;
  readonly contractEvents: ConfigSettingContractEventsV0;

  constructor(contractEvents: ConfigSettingContractEventsV0) {
    super();
    this.contractEvents = contractEvents;
  }

  get value(): ConfigSettingContractEventsV0 {
    return this.contractEvents;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 4 }> {
    return {
      configSettingID: 4,
      contractEvents: this.contractEvents.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractBandwidthV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractBandwidthV0" as const;
  readonly contractBandwidth: ConfigSettingContractBandwidthV0;

  constructor(contractBandwidth: ConfigSettingContractBandwidthV0) {
    super();
    this.contractBandwidth = contractBandwidth;
  }

  get value(): ConfigSettingContractBandwidthV0 {
    return this.contractBandwidth;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 5 }> {
    return {
      configSettingID: 5,
      contractBandwidth: this.contractBandwidth.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractCostParamsCpuInstructions extends ConfigSettingEntryBase {
  readonly type = "configSettingContractCostParamsCpuInstructions" as const;
  readonly contractCostParamsCpuInsns: ContractCostParamEntry[];

  constructor(contractCostParamsCpuInsns: ContractCostParamEntry[]) {
    super();
    this.contractCostParamsCpuInsns = contractCostParamsCpuInsns;
  }

  get value(): ContractCostParamEntry[] {
    return this.contractCostParamsCpuInsns;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 6 }> {
    return {
      configSettingID: 6,
      contractCostParamsCpuInsns: this.contractCostParamsCpuInsns.map((v) =>
        v.toXdrObject(),
      ),
    };
  }
}

export class ConfigSettingEntryContractCostParamsMemoryBytes extends ConfigSettingEntryBase {
  readonly type = "configSettingContractCostParamsMemoryBytes" as const;
  readonly contractCostParamsMemBytes: ContractCostParamEntry[];

  constructor(contractCostParamsMemBytes: ContractCostParamEntry[]) {
    super();
    this.contractCostParamsMemBytes = contractCostParamsMemBytes;
  }

  get value(): ContractCostParamEntry[] {
    return this.contractCostParamsMemBytes;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 7 }> {
    return {
      configSettingID: 7,
      contractCostParamsMemBytes: this.contractCostParamsMemBytes.map((v) =>
        v.toXdrObject(),
      ),
    };
  }
}

export class ConfigSettingEntryContractDataKeySizeBytes extends ConfigSettingEntryBase {
  readonly type = "configSettingContractDataKeySizeBytes" as const;
  readonly contractDataKeySizeBytes: number;

  constructor(contractDataKeySizeBytes: number) {
    super();
    this.contractDataKeySizeBytes = contractDataKeySizeBytes;
  }

  get value(): number {
    return this.contractDataKeySizeBytes;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 8 }> {
    return {
      configSettingID: 8,
      contractDataKeySizeBytes: this.contractDataKeySizeBytes,
    };
  }
}

export class ConfigSettingEntryContractDataEntrySizeBytes extends ConfigSettingEntryBase {
  readonly type = "configSettingContractDataEntrySizeBytes" as const;
  readonly contractDataEntrySizeBytes: number;

  constructor(contractDataEntrySizeBytes: number) {
    super();
    this.contractDataEntrySizeBytes = contractDataEntrySizeBytes;
  }

  get value(): number {
    return this.contractDataEntrySizeBytes;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 9 }> {
    return {
      configSettingID: 9,
      contractDataEntrySizeBytes: this.contractDataEntrySizeBytes,
    };
  }
}

export class ConfigSettingEntryStateArchival extends ConfigSettingEntryBase {
  readonly type = "configSettingStateArchival" as const;
  readonly stateArchivalSettings: StateArchivalSettings;

  constructor(stateArchivalSettings: StateArchivalSettings) {
    super();
    this.stateArchivalSettings = stateArchivalSettings;
  }

  get value(): StateArchivalSettings {
    return this.stateArchivalSettings;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 10 }> {
    return {
      configSettingID: 10,
      stateArchivalSettings: this.stateArchivalSettings.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractExecutionLanes extends ConfigSettingEntryBase {
  readonly type = "configSettingContractExecutionLanes" as const;
  readonly contractExecutionLanes: ConfigSettingContractExecutionLanesV0;

  constructor(contractExecutionLanes: ConfigSettingContractExecutionLanesV0) {
    super();
    this.contractExecutionLanes = contractExecutionLanes;
  }

  get value(): ConfigSettingContractExecutionLanesV0 {
    return this.contractExecutionLanes;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 11 }> {
    return {
      configSettingID: 11,
      contractExecutionLanes: this.contractExecutionLanes.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryLiveSorobanStateSizeWindow extends ConfigSettingEntryBase {
  readonly type = "configSettingLiveSorobanStateSizeWindow" as const;
  readonly liveSorobanStateSizeWindow: bigint[];

  constructor(liveSorobanStateSizeWindow: bigint[]) {
    super();
    this.liveSorobanStateSizeWindow = liveSorobanStateSizeWindow;
  }

  get value(): bigint[] {
    return this.liveSorobanStateSizeWindow;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 12 }> {
    return {
      configSettingID: 12,
      liveSorobanStateSizeWindow: this.liveSorobanStateSizeWindow,
    };
  }
}

export class ConfigSettingEntryEvictionIterator extends ConfigSettingEntryBase {
  readonly type = "configSettingEvictionIterator" as const;
  readonly evictionIterator: EvictionIterator;

  constructor(evictionIterator: EvictionIterator) {
    super();
    this.evictionIterator = evictionIterator;
  }

  get value(): EvictionIterator {
    return this.evictionIterator;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 13 }> {
    return {
      configSettingID: 13,
      evictionIterator: this.evictionIterator.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractParallelComputeV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractParallelComputeV0" as const;
  readonly contractParallelCompute: ConfigSettingContractParallelComputeV0;

  constructor(contractParallelCompute: ConfigSettingContractParallelComputeV0) {
    super();
    this.contractParallelCompute = contractParallelCompute;
  }

  get value(): ConfigSettingContractParallelComputeV0 {
    return this.contractParallelCompute;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 14 }> {
    return {
      configSettingID: 14,
      contractParallelCompute: this.contractParallelCompute.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryContractLedgerCostExtV0 extends ConfigSettingEntryBase {
  readonly type = "configSettingContractLedgerCostExtV0" as const;
  readonly contractLedgerCostExt: ConfigSettingContractLedgerCostExtV0;

  constructor(contractLedgerCostExt: ConfigSettingContractLedgerCostExtV0) {
    super();
    this.contractLedgerCostExt = contractLedgerCostExt;
  }

  get value(): ConfigSettingContractLedgerCostExtV0 {
    return this.contractLedgerCostExt;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 15 }> {
    return {
      configSettingID: 15,
      contractLedgerCostExt: this.contractLedgerCostExt.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryScpTiming extends ConfigSettingEntryBase {
  readonly type = "configSettingScpTiming" as const;
  readonly contractScpTiming: ConfigSettingScpTiming;

  constructor(contractScpTiming: ConfigSettingScpTiming) {
    super();
    this.contractScpTiming = contractScpTiming;
  }

  get value(): ConfigSettingScpTiming {
    return this.contractScpTiming;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 16 }> {
    return {
      configSettingID: 16,
      contractScpTiming: this.contractScpTiming.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryFrozenLedgerKeys extends ConfigSettingEntryBase {
  readonly type = "configSettingFrozenLedgerKeys" as const;
  readonly frozenLedgerKeys: FrozenLedgerKeys;

  constructor(frozenLedgerKeys: FrozenLedgerKeys) {
    super();
    this.frozenLedgerKeys = frozenLedgerKeys;
  }

  get value(): FrozenLedgerKeys {
    return this.frozenLedgerKeys;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 17 }> {
    return {
      configSettingID: 17,
      frozenLedgerKeys: this.frozenLedgerKeys.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryFrozenLedgerKeysDelta extends ConfigSettingEntryBase {
  readonly type = "configSettingFrozenLedgerKeysDelta" as const;
  readonly frozenLedgerKeysDelta: FrozenLedgerKeysDelta;

  constructor(frozenLedgerKeysDelta: FrozenLedgerKeysDelta) {
    super();
    this.frozenLedgerKeysDelta = frozenLedgerKeysDelta;
  }

  get value(): FrozenLedgerKeysDelta {
    return this.frozenLedgerKeysDelta;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 18 }> {
    return {
      configSettingID: 18,
      frozenLedgerKeysDelta: this.frozenLedgerKeysDelta.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryFreezeBypassTxs extends ConfigSettingEntryBase {
  readonly type = "configSettingFreezeBypassTxs" as const;
  readonly freezeBypassTxs: FreezeBypassTxs;

  constructor(freezeBypassTxs: FreezeBypassTxs) {
    super();
    this.freezeBypassTxs = freezeBypassTxs;
  }

  get value(): FreezeBypassTxs {
    return this.freezeBypassTxs;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 19 }> {
    return {
      configSettingID: 19,
      freezeBypassTxs: this.freezeBypassTxs.toXdrObject(),
    };
  }
}

export class ConfigSettingEntryFreezeBypassTxsDelta extends ConfigSettingEntryBase {
  readonly type = "configSettingFreezeBypassTxsDelta" as const;
  readonly freezeBypassTxsDelta: FreezeBypassTxsDelta;

  constructor(freezeBypassTxsDelta: FreezeBypassTxsDelta) {
    super();
    this.freezeBypassTxsDelta = freezeBypassTxsDelta;
  }

  get value(): FreezeBypassTxsDelta {
    return this.freezeBypassTxsDelta;
  }

  toXdrObject(): Extract<ConfigSettingEntryWire, { configSettingID: 20 }> {
    return {
      configSettingID: 20,
      freezeBypassTxsDelta: this.freezeBypassTxsDelta.toXdrObject(),
    };
  }
}

export type ConfigSettingEntry =
  | ConfigSettingEntryContractMaxSizeBytes
  | ConfigSettingEntryContractComputeV0
  | ConfigSettingEntryContractLedgerCostV0
  | ConfigSettingEntryContractHistoricalDataV0
  | ConfigSettingEntryContractEventsV0
  | ConfigSettingEntryContractBandwidthV0
  | ConfigSettingEntryContractCostParamsCpuInstructions
  | ConfigSettingEntryContractCostParamsMemoryBytes
  | ConfigSettingEntryContractDataKeySizeBytes
  | ConfigSettingEntryContractDataEntrySizeBytes
  | ConfigSettingEntryStateArchival
  | ConfigSettingEntryContractExecutionLanes
  | ConfigSettingEntryLiveSorobanStateSizeWindow
  | ConfigSettingEntryEvictionIterator
  | ConfigSettingEntryContractParallelComputeV0
  | ConfigSettingEntryContractLedgerCostExtV0
  | ConfigSettingEntryScpTiming
  | ConfigSettingEntryFrozenLedgerKeys
  | ConfigSettingEntryFrozenLedgerKeysDelta
  | ConfigSettingEntryFreezeBypassTxs
  | ConfigSettingEntryFreezeBypassTxsDelta;
export const ConfigSettingEntry = ConfigSettingEntryBase;
