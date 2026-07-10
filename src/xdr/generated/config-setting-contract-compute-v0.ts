import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractComputeV0Wire {
  ledgerMaxInstructions: bigint;
  txMaxInstructions: bigint;
  feeRatePerInstructionsIncrement: bigint;
  txMemoryLimit: number;
}

/**
 * ```xdr
 * struct ConfigSettingContractComputeV0
 * {
 *     // Maximum instructions per ledger
 *     int64 ledgerMaxInstructions;
 *     // Maximum instructions per transaction
 *     int64 txMaxInstructions;
 *     // Cost of 10000 instructions
 *     int64 feeRatePerInstructionsIncrement;
 *
 *     // Memory limit per transaction. Unlike instructions, there is no fee
 *     // for memory, just the limit.
 *     uint32 txMemoryLimit;
 * };
 * ```
 */
export class ConfigSettingContractComputeV0 extends XdrValue {
  readonly ledgerMaxInstructions: bigint;
  readonly txMaxInstructions: bigint;
  readonly feeRatePerInstructionsIncrement: bigint;
  readonly txMemoryLimit: number;

  static readonly schema: XdrType<ConfigSettingContractComputeV0Wire> = struct(
    "ConfigSettingContractComputeV0",
    {
      ledgerMaxInstructions: int64(),
      txMaxInstructions: int64(),
      feeRatePerInstructionsIncrement: int64(),
      txMemoryLimit: uint32(),
    },
  );

  constructor(input: {
    ledgerMaxInstructions: bigint;
    txMaxInstructions: bigint;
    feeRatePerInstructionsIncrement: bigint;
    txMemoryLimit: number;
  }) {
    super();
    this.ledgerMaxInstructions = input.ledgerMaxInstructions;
    this.txMaxInstructions = input.txMaxInstructions;
    this.feeRatePerInstructionsIncrement =
      input.feeRatePerInstructionsIncrement;
    this.txMemoryLimit = input.txMemoryLimit;
  }

  toXdrObject(): ConfigSettingContractComputeV0Wire {
    return {
      ledgerMaxInstructions: this.ledgerMaxInstructions,
      txMaxInstructions: this.txMaxInstructions,
      feeRatePerInstructionsIncrement: this.feeRatePerInstructionsIncrement,
      txMemoryLimit: this.txMemoryLimit,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractComputeV0Wire,
  ): ConfigSettingContractComputeV0 {
    return new ConfigSettingContractComputeV0({
      ledgerMaxInstructions: wire.ledgerMaxInstructions,
      txMaxInstructions: wire.txMaxInstructions,
      feeRatePerInstructionsIncrement: wire.feeRatePerInstructionsIncrement,
      txMemoryLimit: wire.txMemoryLimit,
    });
  }
}
