import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type SorobanAuthorizedFunctionTypeWire = number;

export type SorobanAuthorizedFunctionTypeName =
  | "sorobanAuthorizedFunctionTypeContractFn"
  | "sorobanAuthorizedFunctionTypeCreateContractHostFn"
  | "sorobanAuthorizedFunctionTypeCreateContractV2HostFn";

/**
 * ```xdr
 * enum SorobanAuthorizedFunctionType
 * {
 *     SOROBAN_AUTHORIZED_FUNCTION_TYPE_CONTRACT_FN = 0,
 *     SOROBAN_AUTHORIZED_FUNCTION_TYPE_CREATE_CONTRACT_HOST_FN = 1,
 *     SOROBAN_AUTHORIZED_FUNCTION_TYPE_CREATE_CONTRACT_V2_HOST_FN = 2
 * };
 * ```
 */
export class SorobanAuthorizedFunctionType extends EnumValue<SorobanAuthorizedFunctionTypeName> {
  static readonly sorobanAuthorizedFunctionTypeContractFn =
    new SorobanAuthorizedFunctionType(
      "sorobanAuthorizedFunctionTypeContractFn",
      0,
    );
  static readonly sorobanAuthorizedFunctionTypeCreateContractHostFn =
    new SorobanAuthorizedFunctionType(
      "sorobanAuthorizedFunctionTypeCreateContractHostFn",
      1,
    );
  static readonly sorobanAuthorizedFunctionTypeCreateContractV2HostFn =
    new SorobanAuthorizedFunctionType(
      "sorobanAuthorizedFunctionTypeCreateContractV2HostFn",
      2,
    );

  static readonly schema = enumType("SorobanAuthorizedFunctionType", {
    sorobanAuthorizedFunctionTypeContractFn: 0,
    sorobanAuthorizedFunctionTypeCreateContractHostFn: 1,
    sorobanAuthorizedFunctionTypeCreateContractV2HostFn: 2,
  });

  static fromValue(value: number): SorobanAuthorizedFunctionType {
    return enumFromValue(
      "SorobanAuthorizedFunctionType",
      SorobanAuthorizedFunctionType.schema,
      SorobanAuthorizedFunctionType,
      value,
    );
  }

  static fromName(
    name: SorobanAuthorizedFunctionTypeName,
  ): SorobanAuthorizedFunctionType {
    return enumFromName(
      "SorobanAuthorizedFunctionType",
      SorobanAuthorizedFunctionType,
      name,
    );
  }

  static fromXdrObject(wire: number): SorobanAuthorizedFunctionType {
    return SorobanAuthorizedFunctionType.fromValue(wire);
  }
}
