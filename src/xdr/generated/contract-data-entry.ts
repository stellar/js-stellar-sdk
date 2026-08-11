import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";
import {
  ContractDataDurability,
  type ContractDataDurabilityWire,
} from "./contract-data-durability.js";

export interface ContractDataEntryWire {
  ext: ExtensionPointWire;
  contract: ScAddressWire;
  key: ScValWire;
  durability: ContractDataDurabilityWire;
  val: ScValWire;
}

/**
 * ```xdr
 * struct ContractDataEntry {
 *     ExtensionPoint ext;
 *
 *     SCAddress contract;
 *     SCVal key;
 *     ContractDataDurability durability;
 *     SCVal val;
 * };
 * ```
 */
export class ContractDataEntry extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly contract: ScAddress;
  readonly key: ScVal;
  readonly durability: ContractDataDurability;
  readonly val: ScVal;

  static readonly schema: XdrType<ContractDataEntryWire> = struct(
    "ContractDataEntry",
    {
      ext: ExtensionPoint.schema,
      contract: ScAddress.schema,
      key: ScVal.schema,
      durability: ContractDataDurability.schema,
      val: ScVal.schema,
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    contract: ScAddress;
    key: ScVal;
    durability: ContractDataDurability;
    val: ScVal;
  }) {
    super();
    this.ext = input.ext;
    this.contract = input.contract;
    this.key = input.key;
    this.durability = input.durability;
    this.val = input.val;
  }

  toXdrObject(): ContractDataEntryWire {
    return {
      ext: this.ext.toXdrObject(),
      contract: this.contract.toXdrObject(),
      key: this.key.toXdrObject(),
      durability: this.durability.toXdrObject(),
      val: this.val.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ContractDataEntryWire): ContractDataEntry {
    return new ContractDataEntry({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      contract: ScAddress.fromXdrObject(wire.contract),
      key: ScVal.fromXdrObject(wire.key),
      durability: ContractDataDurability.fromXdrObject(wire.durability),
      val: ScVal.fromXdrObject(wire.val),
    });
  }
}
