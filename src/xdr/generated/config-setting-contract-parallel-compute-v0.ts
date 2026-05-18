import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractParallelComputeV0Wire {
  ledgerMaxDependentTxClusters: number;
}

/**
 * ```xdr
 * struct ConfigSettingContractParallelComputeV0
 * {
 *     // Maximum number of clusters with dependent transactions allowed in a
 *     // stage of parallel tx set component.
 *     // This effectively sets the lower bound on the number of physical threads
 *     // necessary to effectively apply transaction sets in parallel.
 *     uint32 ledgerMaxDependentTxClusters;
 * };
 * ```
 */
export class ConfigSettingContractParallelComputeV0 extends XdrValue {
  readonly ledgerMaxDependentTxClusters: number;

  static readonly schema: XdrType<ConfigSettingContractParallelComputeV0Wire> =
    struct("ConfigSettingContractParallelComputeV0", {
      ledgerMaxDependentTxClusters: uint32(),
    });

  constructor(input: { ledgerMaxDependentTxClusters: number }) {
    super();
    this.ledgerMaxDependentTxClusters = input.ledgerMaxDependentTxClusters;
  }

  toXdrObject(): ConfigSettingContractParallelComputeV0Wire {
    return {
      ledgerMaxDependentTxClusters: this.ledgerMaxDependentTxClusters,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractParallelComputeV0Wire,
  ): ConfigSettingContractParallelComputeV0 {
    return new ConfigSettingContractParallelComputeV0({
      ledgerMaxDependentTxClusters: wire.ledgerMaxDependentTxClusters,
    });
  }
}
