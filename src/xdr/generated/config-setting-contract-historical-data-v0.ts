import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractHistoricalDataV0Wire {
  feeHistorical1Kb: bigint;
}

/**
 * ```xdr
 * struct ConfigSettingContractHistoricalDataV0
 * {
 *     int64 feeHistorical1KB; // Fee for storing 1KB in archives
 * };
 * ```
 */
export class ConfigSettingContractHistoricalDataV0 extends XdrValue {
  readonly feeHistorical1Kb: bigint;

  static readonly schema: XdrType<ConfigSettingContractHistoricalDataV0Wire> =
    struct("ConfigSettingContractHistoricalDataV0", {
      feeHistorical1Kb: int64(),
    });

  constructor(input: { feeHistorical1Kb: bigint }) {
    super();
    this.feeHistorical1Kb = input.feeHistorical1Kb;
  }

  toXdrObject(): ConfigSettingContractHistoricalDataV0Wire {
    return {
      feeHistorical1Kb: this.feeHistorical1Kb,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractHistoricalDataV0Wire,
  ): ConfigSettingContractHistoricalDataV0 {
    return new ConfigSettingContractHistoricalDataV0({
      feeHistorical1Kb: wire.feeHistorical1Kb,
    });
  }
}
