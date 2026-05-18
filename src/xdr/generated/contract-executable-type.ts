import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ContractExecutableType>
  > = {
    0: ContractExecutableType.contractExecutableWasm,
    1: ContractExecutableType.contractExecutableStellarAsset,
  };

  static readonly schema = enumType("ContractExecutableType", {
    contractExecutableWasm: 0,
    contractExecutableStellarAsset: 1,
  });

  static fromValue(value: number): ContractExecutableType {
    return enumLookup(
      "ContractExecutableType",
      ContractExecutableType.byValue,
      value,
    ) as ContractExecutableType;
  }

  static fromName(name: ContractExecutableTypeName): ContractExecutableType {
    switch (name) {
      case "contractExecutableWasm":
        return ContractExecutableType.contractExecutableWasm;
      case "contractExecutableStellarAsset":
        return ContractExecutableType.contractExecutableStellarAsset;
      default:
        throw new XdrError(`ContractExecutableType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ContractExecutableType {
    return ContractExecutableType.fromValue(wire);
  }
}
