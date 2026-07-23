import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractBandwidthV0Wire {
  ledgerMaxTxsSizeBytes: number;
  txMaxSizeBytes: number;
  feeTxSize1Kb: bigint;
}

/**
 * ```xdr
 * struct ConfigSettingContractBandwidthV0
 * {
 *     // Maximum sum of all transaction sizes in the ledger in bytes
 *     uint32 ledgerMaxTxsSizeBytes;
 *     // Maximum size in bytes for a transaction
 *     uint32 txMaxSizeBytes;
 *
 *     // Fee for 1 KB of transaction size
 *     int64 feeTxSize1KB;
 * };
 * ```
 */
export class ConfigSettingContractBandwidthV0 extends XdrValue {
  readonly ledgerMaxTxsSizeBytes: number;
  readonly txMaxSizeBytes: number;
  readonly feeTxSize1Kb: bigint;

  static readonly schema: XdrType<ConfigSettingContractBandwidthV0Wire> =
    struct("ConfigSettingContractBandwidthV0", {
      ledgerMaxTxsSizeBytes: uint32(),
      txMaxSizeBytes: uint32(),
      feeTxSize1Kb: int64(),
    });

  constructor(input: {
    ledgerMaxTxsSizeBytes: number;
    txMaxSizeBytes: number;
    feeTxSize1Kb: bigint;
  }) {
    super();
    this.ledgerMaxTxsSizeBytes = input.ledgerMaxTxsSizeBytes;
    this.txMaxSizeBytes = input.txMaxSizeBytes;
    this.feeTxSize1Kb = input.feeTxSize1Kb;
  }

  toXdrObject(): ConfigSettingContractBandwidthV0Wire {
    return {
      ledgerMaxTxsSizeBytes: this.ledgerMaxTxsSizeBytes,
      txMaxSizeBytes: this.txMaxSizeBytes,
      feeTxSize1Kb: this.feeTxSize1Kb,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractBandwidthV0Wire,
  ): ConfigSettingContractBandwidthV0 {
    return new ConfigSettingContractBandwidthV0({
      ledgerMaxTxsSizeBytes: wire.ledgerMaxTxsSizeBytes,
      txMaxSizeBytes: wire.txMaxSizeBytes,
      feeTxSize1Kb: wire.feeTxSize1Kb,
    });
  }
}
