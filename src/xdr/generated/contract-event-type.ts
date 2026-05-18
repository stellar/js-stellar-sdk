import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ContractEventTypeWire = number;

export type ContractEventTypeName = "system" | "contract" | "diagnostic";

/**
 * ```xdr
 * enum ContractEventType
 * {
 *     SYSTEM = 0,
 *     CONTRACT = 1,
 *     DIAGNOSTIC = 2
 * };
 * ```
 */
export class ContractEventType extends EnumValue<ContractEventTypeName> {
  static readonly system = new ContractEventType("system", 0);
  static readonly contract = new ContractEventType("contract", 1);
  static readonly diagnostic = new ContractEventType("diagnostic", 2);

  private static readonly byValue: Readonly<Record<number, ContractEventType>> =
    {
      0: ContractEventType.system,
      1: ContractEventType.contract,
      2: ContractEventType.diagnostic,
    };

  static readonly schema = enumType("ContractEventType", {
    system: 0,
    contract: 1,
    diagnostic: 2,
  });

  static fromValue(value: number): ContractEventType {
    return enumLookup(
      "ContractEventType",
      ContractEventType.byValue,
      value,
    ) as ContractEventType;
  }

  static fromName(name: ContractEventTypeName): ContractEventType {
    switch (name) {
      case "system":
        return ContractEventType.system;
      case "contract":
        return ContractEventType.contract;
      case "diagnostic":
        return ContractEventType.diagnostic;
      default:
        throw new XdrError(`ContractEventType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ContractEventType {
    return ContractEventType.fromValue(wire);
  }
}
