import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractLedgerCostExtV0Wire {
  txMaxFootprintEntries: number;
  feeWrite1Kb: bigint;
}

/**
 * ```xdr
 * struct ConfigSettingContractLedgerCostExtV0
 * {
 *     // Maximum number of RO+RW entries in the transaction footprint.
 *     uint32 txMaxFootprintEntries;
 *     // Fee per 1 KB of data written to the ledger.
 *     // Unlike the rent fee, this is a flat fee that is charged for any ledger
 *     // write, independent of the type of the entry being written.
 *     int64 feeWrite1KB;
 * };
 * ```
 */
export class ConfigSettingContractLedgerCostExtV0 extends XdrValue {
  readonly txMaxFootprintEntries: number;
  readonly feeWrite1Kb: bigint;

  static readonly schema: XdrType<ConfigSettingContractLedgerCostExtV0Wire> =
    struct("ConfigSettingContractLedgerCostExtV0", {
      txMaxFootprintEntries: uint32(),
      feeWrite1Kb: int64(),
    });

  constructor(input: { txMaxFootprintEntries: number; feeWrite1Kb: bigint }) {
    super();
    this.txMaxFootprintEntries = input.txMaxFootprintEntries;
    this.feeWrite1Kb = input.feeWrite1Kb;
  }

  toXdrObject(): ConfigSettingContractLedgerCostExtV0Wire {
    return {
      txMaxFootprintEntries: this.txMaxFootprintEntries,
      feeWrite1Kb: this.feeWrite1Kb,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractLedgerCostExtV0Wire,
  ): ConfigSettingContractLedgerCostExtV0 {
    return new ConfigSettingContractLedgerCostExtV0({
      txMaxFootprintEntries: wire.txMaxFootprintEntries,
      feeWrite1Kb: wire.feeWrite1Kb,
    });
  }
}
