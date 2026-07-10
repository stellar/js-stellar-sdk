import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractExecutionLanesV0Wire {
  ledgerMaxTxCount: number;
}

/**
 * ```xdr
 * struct ConfigSettingContractExecutionLanesV0
 * {
 *     // maximum number of Soroban transactions per ledger
 *     uint32 ledgerMaxTxCount;
 * };
 * ```
 */
export class ConfigSettingContractExecutionLanesV0 extends XdrValue {
  readonly ledgerMaxTxCount: number;

  static readonly schema: XdrType<ConfigSettingContractExecutionLanesV0Wire> =
    struct("ConfigSettingContractExecutionLanesV0", {
      ledgerMaxTxCount: uint32(),
    });

  constructor(input: { ledgerMaxTxCount: number }) {
    super();
    this.ledgerMaxTxCount = input.ledgerMaxTxCount;
  }

  toXdrObject(): ConfigSettingContractExecutionLanesV0Wire {
    return {
      ledgerMaxTxCount: this.ledgerMaxTxCount,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractExecutionLanesV0Wire,
  ): ConfigSettingContractExecutionLanesV0 {
    return new ConfigSettingContractExecutionLanesV0({
      ledgerMaxTxCount: wire.ledgerMaxTxCount,
    });
  }
}
