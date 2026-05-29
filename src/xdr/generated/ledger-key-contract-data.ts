import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";
import {
  ContractDataDurability,
  type ContractDataDurabilityWire,
} from "./contract-data-durability.js";

export interface LedgerKeyContractDataWire {
  contract: ScAddressWire;
  key: ScValWire;
  durability: ContractDataDurabilityWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         SCAddress contract;
 *         SCVal key;
 *         ContractDataDurability durability;
 *     }
 * ```
 */
export class LedgerKeyContractData extends XdrValue {
  readonly contract: ScAddress;
  readonly key: ScVal;
  readonly durability: ContractDataDurability;

  static readonly schema: XdrType<LedgerKeyContractDataWire> = struct(
    "LedgerKeyContractData",
    {
      contract: ScAddress.schema,
      key: ScVal.schema,
      durability: ContractDataDurability.schema,
    },
  );

  constructor(input: {
    contract: ScAddress;
    key: ScVal;
    durability: ContractDataDurability;
  }) {
    super();
    this.contract = input.contract;
    this.key = input.key;
    this.durability = input.durability;
  }

  toXdrObject(): LedgerKeyContractDataWire {
    return {
      contract: this.contract.toXdrObject(),
      key: this.key.toXdrObject(),
      durability: this.durability.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerKeyContractDataWire): LedgerKeyContractData {
    return new LedgerKeyContractData({
      contract: ScAddress.fromXdrObject(wire.contract),
      key: ScVal.fromXdrObject(wire.key),
      durability: ContractDataDurability.fromXdrObject(wire.durability),
    });
  }
}
