import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, SorobanAuthorizedFunctionType>
  > = {
    0: SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeContractFn,
    1: SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeCreateContractHostFn,
    2: SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeCreateContractV2HostFn,
  };

  static readonly schema = enumType("SorobanAuthorizedFunctionType", {
    sorobanAuthorizedFunctionTypeContractFn: 0,
    sorobanAuthorizedFunctionTypeCreateContractHostFn: 1,
    sorobanAuthorizedFunctionTypeCreateContractV2HostFn: 2,
  });

  static fromValue(value: number): SorobanAuthorizedFunctionType {
    return enumLookup(
      "SorobanAuthorizedFunctionType",
      SorobanAuthorizedFunctionType.byValue,
      value,
    ) as SorobanAuthorizedFunctionType;
  }

  static fromName(
    name: SorobanAuthorizedFunctionTypeName,
  ): SorobanAuthorizedFunctionType {
    switch (name) {
      case "sorobanAuthorizedFunctionTypeContractFn":
        return SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeContractFn;
      case "sorobanAuthorizedFunctionTypeCreateContractHostFn":
        return SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeCreateContractHostFn;
      case "sorobanAuthorizedFunctionTypeCreateContractV2HostFn":
        return SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeCreateContractV2HostFn;
      default:
        throw new XdrError(
          `SorobanAuthorizedFunctionType: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): SorobanAuthorizedFunctionType {
    return SorobanAuthorizedFunctionType.fromValue(wire);
  }
}
