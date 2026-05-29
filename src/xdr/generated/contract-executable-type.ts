import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ContractExecutableTypeWire = number;

export type ContractExecutableTypeName =
  | "contractExecutableWasm"
  | "contractExecutableStellarAsset";

/**
 * ```xdr
 * enum ContractExecutableType
 * {
 *     CONTRACT_EXECUTABLE_WASM = 0,
 *     CONTRACT_EXECUTABLE_STELLAR_ASSET = 1
 * };
 * ```
 */
export class ContractExecutableType extends EnumValue<ContractExecutableTypeName> {
  static readonly contractExecutableWasm = new ContractExecutableType(
    "contractExecutableWasm",
    0,
  );
  static readonly contractExecutableStellarAsset = new ContractExecutableType(
    "contractExecutableStellarAsset",
    1,
  );

  static readonly schema = enumType("ContractExecutableType", {
    contractExecutableWasm: 0,
    contractExecutableStellarAsset: 1,
  });

  static fromValue(value: number): ContractExecutableType {
    return enumFromValue(
      "ContractExecutableType",
      ContractExecutableType.schema,
      ContractExecutableType,
      value,
    );
  }

  static fromName(name: ContractExecutableTypeName): ContractExecutableType {
    return enumFromName("ContractExecutableType", ContractExecutableType, name);
  }

  static fromXdrObject(wire: number): ContractExecutableType {
    return ContractExecutableType.fromValue(wire);
  }
}
