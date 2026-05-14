// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ConfigSettingContractBandwidthV0 } from "./config-setting-contract-bandwidth-v0.js";
import { ConfigSettingContractComputeV0 } from "./config-setting-contract-compute-v0.js";
import { ConfigSettingContractEventsV0 } from "./config-setting-contract-events-v0.js";
import { ConfigSettingContractExecutionLanesV0 } from "./config-setting-contract-execution-lanes-v0.js";
import { ConfigSettingContractHistoricalDataV0 } from "./config-setting-contract-historical-data-v0.js";
import { ConfigSettingContractLedgerCostExtV0 } from "./config-setting-contract-ledger-cost-ext-v0.js";
import { ConfigSettingContractLedgerCostV0 } from "./config-setting-contract-ledger-cost-v0.js";
import { ConfigSettingContractParallelComputeV0 } from "./config-setting-contract-parallel-compute-v0.js";
import { ConfigSettingId } from "./config-setting-id.js";
import { ConfigSettingSCPTiming } from "./config-setting-scp-timing.js";
import { ContractCostParams } from "./contract-cost-params.js";
import { EvictionIterator } from "./eviction-iterator.js";
import { FreezeBypassTxs } from "./freeze-bypass-txs.js";
import { FreezeBypassTxsDelta } from "./freeze-bypass-txs-delta.js";
import { FrozenLedgerKeys } from "./frozen-ledger-keys.js";
import { FrozenLedgerKeysDelta } from "./frozen-ledger-keys-delta.js";
import { StateArchivalSettings } from "./state-archival-settings.js";
export type ConfigSettingEntry =
  | {
      readonly configSettingId: 0;
      readonly contractMaxSizeBytes: number;
    }
  | {
      readonly configSettingId: 1;
      readonly contractCompute: ConfigSettingContractComputeV0;
    }
  | {
      readonly configSettingId: 2;
      readonly contractLedgerCost: ConfigSettingContractLedgerCostV0;
    }
  | {
      readonly configSettingId: 3;
      readonly contractHistoricalData: ConfigSettingContractHistoricalDataV0;
    }
  | {
      readonly configSettingId: 4;
      readonly contractEvents: ConfigSettingContractEventsV0;
    }
  | {
      readonly configSettingId: 5;
      readonly contractBandwidth: ConfigSettingContractBandwidthV0;
    }
  | {
      readonly configSettingId: 6;
      readonly contractCostParamsCpuInsns: ContractCostParams;
    }
  | {
      readonly configSettingId: 7;
      readonly contractCostParamsMemBytes: ContractCostParams;
    }
  | {
      readonly configSettingId: 8;
      readonly contractDataKeySizeBytes: number;
    }
  | {
      readonly configSettingId: 9;
      readonly contractDataEntrySizeBytes: number;
    }
  | {
      readonly configSettingId: 10;
      readonly stateArchivalSettings: StateArchivalSettings;
    }
  | {
      readonly configSettingId: 11;
      readonly contractExecutionLanes: ConfigSettingContractExecutionLanesV0;
    }
  | {
      readonly configSettingId: 12;
      readonly liveSorobanStateSizeWindow: bigint[];
    }
  | {
      readonly configSettingId: 13;
      readonly evictionIterator: EvictionIterator;
    }
  | {
      readonly configSettingId: 14;
      readonly contractParallelCompute: ConfigSettingContractParallelComputeV0;
    }
  | {
      readonly configSettingId: 15;
      readonly contractLedgerCostExt: ConfigSettingContractLedgerCostExtV0;
    }
  | {
      readonly configSettingId: 16;
      readonly contractSCPTiming: ConfigSettingSCPTiming;
    }
  | {
      readonly configSettingId: 17;
      readonly frozenLedgerKeys: FrozenLedgerKeys;
    }
  | {
      readonly configSettingId: 18;
      readonly frozenLedgerKeysDelta: FrozenLedgerKeysDelta;
    }
  | {
      readonly configSettingId: 19;
      readonly freezeBypassTxs: FreezeBypassTxs;
    }
  | {
      readonly configSettingId: 20;
      readonly freezeBypassTxsDelta: FreezeBypassTxsDelta;
    };
export const ConfigSettingEntry = xdr.union("ConfigSettingEntry", {
  switchOn: xdr.lazy(() => ConfigSettingId),
  switchKey: "configSettingId",
  cases: [
    xdr.case(
      "configSettingContractMaxSizeBytes",
      0,
      xdr.field("contractMaxSizeBytes", xdr.uint32()),
    ),
    xdr.case(
      "configSettingContractComputeV0",
      1,
      xdr.field(
        "contractCompute",
        xdr.lazy(() => ConfigSettingContractComputeV0),
      ),
    ),
    xdr.case(
      "configSettingContractLedgerCostV0",
      2,
      xdr.field(
        "contractLedgerCost",
        xdr.lazy(() => ConfigSettingContractLedgerCostV0),
      ),
    ),
    xdr.case(
      "configSettingContractHistoricalDataV0",
      3,
      xdr.field(
        "contractHistoricalData",
        xdr.lazy(() => ConfigSettingContractHistoricalDataV0),
      ),
    ),
    xdr.case(
      "configSettingContractEventsV0",
      4,
      xdr.field(
        "contractEvents",
        xdr.lazy(() => ConfigSettingContractEventsV0),
      ),
    ),
    xdr.case(
      "configSettingContractBandwidthV0",
      5,
      xdr.field(
        "contractBandwidth",
        xdr.lazy(() => ConfigSettingContractBandwidthV0),
      ),
    ),
    xdr.case(
      "configSettingContractCostParamsCpuInstructions",
      6,
      xdr.field(
        "contractCostParamsCpuInsns",
        xdr.lazy(() => ContractCostParams),
      ),
    ),
    xdr.case(
      "configSettingContractCostParamsMemoryBytes",
      7,
      xdr.field(
        "contractCostParamsMemBytes",
        xdr.lazy(() => ContractCostParams),
      ),
    ),
    xdr.case(
      "configSettingContractDataKeySizeBytes",
      8,
      xdr.field("contractDataKeySizeBytes", xdr.uint32()),
    ),
    xdr.case(
      "configSettingContractDataEntrySizeBytes",
      9,
      xdr.field("contractDataEntrySizeBytes", xdr.uint32()),
    ),
    xdr.case(
      "configSettingStateArchival",
      10,
      xdr.field(
        "stateArchivalSettings",
        xdr.lazy(() => StateArchivalSettings),
      ),
    ),
    xdr.case(
      "configSettingContractExecutionLanes",
      11,
      xdr.field(
        "contractExecutionLanes",
        xdr.lazy(() => ConfigSettingContractExecutionLanesV0),
      ),
    ),
    xdr.case(
      "configSettingLiveSorobanStateSizeWindow",
      12,
      xdr.field(
        "liveSorobanStateSizeWindow",
        xdr.array(xdr.uint64(), xdr.UNBOUNDED_MAX_LENGTH),
      ),
    ),
    xdr.case(
      "configSettingEvictionIterator",
      13,
      xdr.field(
        "evictionIterator",
        xdr.lazy(() => EvictionIterator),
      ),
    ),
    xdr.case(
      "configSettingContractParallelComputeV0",
      14,
      xdr.field(
        "contractParallelCompute",
        xdr.lazy(() => ConfigSettingContractParallelComputeV0),
      ),
    ),
    xdr.case(
      "configSettingContractLedgerCostExtV0",
      15,
      xdr.field(
        "contractLedgerCostExt",
        xdr.lazy(() => ConfigSettingContractLedgerCostExtV0),
      ),
    ),
    xdr.case(
      "configSettingScpTiming",
      16,
      xdr.field(
        "contractSCPTiming",
        xdr.lazy(() => ConfigSettingSCPTiming),
      ),
    ),
    xdr.case(
      "configSettingFrozenLedgerKeys",
      17,
      xdr.field(
        "frozenLedgerKeys",
        xdr.lazy(() => FrozenLedgerKeys),
      ),
    ),
    xdr.case(
      "configSettingFrozenLedgerKeysDelta",
      18,
      xdr.field(
        "frozenLedgerKeysDelta",
        xdr.lazy(() => FrozenLedgerKeysDelta),
      ),
    ),
    xdr.case(
      "configSettingFreezeBypassTxs",
      19,
      xdr.field(
        "freezeBypassTxs",
        xdr.lazy(() => FreezeBypassTxs),
      ),
    ),
    xdr.case(
      "configSettingFreezeBypassTxsDelta",
      20,
      xdr.field(
        "freezeBypassTxsDelta",
        xdr.lazy(() => FreezeBypassTxsDelta),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ConfigSettingEntry>;
