import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ContractIdPreimageTypeWire = number;

export type ContractIdPreimageTypeName =
  | "contractIdPreimageFromAddress"
  | "contractIdPreimageFromAsset";

/**
 * ```xdr
 * enum ContractIDPreimageType
 * {
 *     CONTRACT_ID_PREIMAGE_FROM_ADDRESS = 0,
 *     CONTRACT_ID_PREIMAGE_FROM_ASSET = 1
 * };
 * ```
 */
export class ContractIdPreimageType extends EnumValue<ContractIdPreimageTypeName> {
  static readonly contractIdPreimageFromAddress = new ContractIdPreimageType(
    "contractIdPreimageFromAddress",
    0,
  );
  static readonly contractIdPreimageFromAsset = new ContractIdPreimageType(
    "contractIdPreimageFromAsset",
    1,
  );

  private static readonly byValue: Readonly<
    Record<number, ContractIdPreimageType>
  > = {
    0: ContractIdPreimageType.contractIdPreimageFromAddress,
    1: ContractIdPreimageType.contractIdPreimageFromAsset,
  };

  static readonly schema = enumType("ContractIdPreimageType", {
    contractIdPreimageFromAddress: 0,
    contractIdPreimageFromAsset: 1,
  });

  static fromValue(value: number): ContractIdPreimageType {
    return enumLookup(
      "ContractIdPreimageType",
      ContractIdPreimageType.byValue,
      value,
    ) as ContractIdPreimageType;
  }

  static fromName(name: ContractIdPreimageTypeName): ContractIdPreimageType {
    switch (name) {
      case "contractIdPreimageFromAddress":
        return ContractIdPreimageType.contractIdPreimageFromAddress;
      case "contractIdPreimageFromAsset":
        return ContractIdPreimageType.contractIdPreimageFromAsset;
      default:
        throw new XdrError(`ContractIdPreimageType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ContractIdPreimageType {
    return ContractIdPreimageType.fromValue(wire);
  }
}
