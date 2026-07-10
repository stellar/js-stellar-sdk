import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractEventsV0Wire {
  txMaxContractEventsSizeBytes: number;
  feeContractEvents1Kb: bigint;
}

/**
 * ```xdr
 * struct ConfigSettingContractEventsV0
 * {
 *     // Maximum size of events that a contract call can emit.
 *     uint32 txMaxContractEventsSizeBytes;
 *     // Fee for generating 1KB of contract events.
 *     int64 feeContractEvents1KB;
 * };
 * ```
 */
export class ConfigSettingContractEventsV0 extends XdrValue {
  readonly txMaxContractEventsSizeBytes: number;
  readonly feeContractEvents1Kb: bigint;

  static readonly schema: XdrType<ConfigSettingContractEventsV0Wire> = struct(
    "ConfigSettingContractEventsV0",
    {
      txMaxContractEventsSizeBytes: uint32(),
      feeContractEvents1Kb: int64(),
    },
  );

  constructor(input: {
    txMaxContractEventsSizeBytes: number;
    feeContractEvents1Kb: bigint;
  }) {
    super();
    this.txMaxContractEventsSizeBytes = input.txMaxContractEventsSizeBytes;
    this.feeContractEvents1Kb = input.feeContractEvents1Kb;
  }

  toXdrObject(): ConfigSettingContractEventsV0Wire {
    return {
      txMaxContractEventsSizeBytes: this.txMaxContractEventsSizeBytes,
      feeContractEvents1Kb: this.feeContractEvents1Kb,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractEventsV0Wire,
  ): ConfigSettingContractEventsV0 {
    return new ConfigSettingContractEventsV0({
      txMaxContractEventsSizeBytes: wire.txMaxContractEventsSizeBytes,
      feeContractEvents1Kb: wire.feeContractEvents1Kb,
    });
  }
}
