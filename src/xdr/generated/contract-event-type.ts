import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ContractEventType", {
    system: 0,
    contract: 1,
    diagnostic: 2,
  });

  static fromValue(value: number): ContractEventType {
    return enumFromValue(
      "ContractEventType",
      ContractEventType.schema,
      ContractEventType,
      value,
    );
  }

  static fromName(name: ContractEventTypeName): ContractEventType {
    return enumFromName("ContractEventType", ContractEventType, name);
  }

  static fromXdrObject(wire: number): ContractEventType {
    return ContractEventType.fromValue(wire);
  }
}
