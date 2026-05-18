import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type HostFunctionTypeWire = number;

export type HostFunctionTypeName =
  | "hostFunctionTypeInvokeContract"
  | "hostFunctionTypeCreateContract"
  | "hostFunctionTypeUploadContractWasm"
  | "hostFunctionTypeCreateContractV2";

/**
 * ```xdr
 * enum HostFunctionType
 * {
 *     HOST_FUNCTION_TYPE_INVOKE_CONTRACT = 0,
 *     HOST_FUNCTION_TYPE_CREATE_CONTRACT = 1,
 *     HOST_FUNCTION_TYPE_UPLOAD_CONTRACT_WASM = 2,
 *     HOST_FUNCTION_TYPE_CREATE_CONTRACT_V2 = 3
 * };
 * ```
 */
export class HostFunctionType extends EnumValue<HostFunctionTypeName> {
  static readonly hostFunctionTypeInvokeContract = new HostFunctionType(
    "hostFunctionTypeInvokeContract",
    0,
  );
  static readonly hostFunctionTypeCreateContract = new HostFunctionType(
    "hostFunctionTypeCreateContract",
    1,
  );
  static readonly hostFunctionTypeUploadContractWasm = new HostFunctionType(
    "hostFunctionTypeUploadContractWasm",
    2,
  );
  static readonly hostFunctionTypeCreateContractV2 = new HostFunctionType(
    "hostFunctionTypeCreateContractV2",
    3,
  );

  private static readonly byValue: Readonly<Record<number, HostFunctionType>> =
    {
      0: HostFunctionType.hostFunctionTypeInvokeContract,
      1: HostFunctionType.hostFunctionTypeCreateContract,
      2: HostFunctionType.hostFunctionTypeUploadContractWasm,
      3: HostFunctionType.hostFunctionTypeCreateContractV2,
    };

  static readonly schema = enumType("HostFunctionType", {
    hostFunctionTypeInvokeContract: 0,
    hostFunctionTypeCreateContract: 1,
    hostFunctionTypeUploadContractWasm: 2,
    hostFunctionTypeCreateContractV2: 3,
  });

  static fromValue(value: number): HostFunctionType {
    return enumLookup(
      "HostFunctionType",
      HostFunctionType.byValue,
      value,
    ) as HostFunctionType;
  }

  static fromName(name: HostFunctionTypeName): HostFunctionType {
    switch (name) {
      case "hostFunctionTypeInvokeContract":
        return HostFunctionType.hostFunctionTypeInvokeContract;
      case "hostFunctionTypeCreateContract":
        return HostFunctionType.hostFunctionTypeCreateContract;
      case "hostFunctionTypeUploadContractWasm":
        return HostFunctionType.hostFunctionTypeUploadContractWasm;
      case "hostFunctionTypeCreateContractV2":
        return HostFunctionType.hostFunctionTypeCreateContractV2;
      default:
        throw new XdrError(`HostFunctionType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): HostFunctionType {
    return HostFunctionType.fromValue(wire);
  }
}
