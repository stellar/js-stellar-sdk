import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ContractDataDurability>
  > = {
    0: ContractDataDurability.temporary,
    1: ContractDataDurability.persistent,
  };

  static readonly schema = enumType("ContractDataDurability", {
    temporary: 0,
    persistent: 1,
  });

  static fromValue(value: number): ContractDataDurability {
    return enumLookup(
      "ContractDataDurability",
      ContractDataDurability.byValue,
      value,
    ) as ContractDataDurability;
  }

  static fromName(name: ContractDataDurabilityName): ContractDataDurability {
    switch (name) {
      case "temporary":
        return ContractDataDurability.temporary;
      case "persistent":
        return ContractDataDurability.persistent;
      default:
        throw new XdrError(`ContractDataDurability: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ContractDataDurability {
    return ContractDataDurability.fromValue(wire);
  }
}
