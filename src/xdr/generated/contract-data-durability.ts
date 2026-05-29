import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ContractDataDurabilityWire = number;

export type ContractDataDurabilityName = "temporary" | "persistent";

/**
 * ```xdr
 * enum ContractDataDurability {
 *     TEMPORARY = 0,
 *     PERSISTENT = 1
 * };
 * ```
 */
export class ContractDataDurability extends EnumValue<ContractDataDurabilityName> {
  static readonly temporary = new ContractDataDurability("temporary", 0);
  static readonly persistent = new ContractDataDurability("persistent", 1);

  static readonly schema = enumType("ContractDataDurability", {
    temporary: 0,
    persistent: 1,
  });

  static fromValue(value: number): ContractDataDurability {
    return enumFromValue(
      "ContractDataDurability",
      ContractDataDurability.schema,
      ContractDataDurability,
      value,
    );
  }

  static fromName(name: ContractDataDurabilityName): ContractDataDurability {
    return enumFromName("ContractDataDurability", ContractDataDurability, name);
  }

  static fromXdrObject(wire: number): ContractDataDurability {
    return ContractDataDurability.fromValue(wire);
  }
}
