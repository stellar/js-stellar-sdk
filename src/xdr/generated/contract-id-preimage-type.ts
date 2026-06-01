import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ContractIdPreimageType", {
      contractIdPreimageFromAddress: 0,
      contractIdPreimageFromAsset: 1,
    }),
    "contractIdPreimageFrom",
  );

  static fromValue(value: number): ContractIdPreimageType {
    return enumFromValue(
      "ContractIdPreimageType",
      ContractIdPreimageType.schema,
      ContractIdPreimageType,
      value,
    );
  }

  static fromName(name: ContractIdPreimageTypeName): ContractIdPreimageType {
    return enumFromName("ContractIdPreimageType", ContractIdPreimageType, name);
  }

  static fromXdrObject(wire: number): ContractIdPreimageType {
    return ContractIdPreimageType.fromValue(wire);
  }
}
