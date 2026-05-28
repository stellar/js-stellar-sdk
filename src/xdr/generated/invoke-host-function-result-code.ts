import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type InvokeHostFunctionResultCodeWire = number;

export type InvokeHostFunctionResultCodeName =
  | "invokeHostFunctionSuccess"
  | "invokeHostFunctionMalformed"
  | "invokeHostFunctionTrapped"
  | "invokeHostFunctionResourceLimitExceeded"
  | "invokeHostFunctionEntryArchived"
  | "invokeHostFunctionInsufficientRefundableFee";

/**
 * ```xdr
 * enum InvokeHostFunctionResultCode
 * {
 *     // codes considered as "success" for the operation
 *     INVOKE_HOST_FUNCTION_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     INVOKE_HOST_FUNCTION_MALFORMED = -1,
 *     INVOKE_HOST_FUNCTION_TRAPPED = -2,
 *     INVOKE_HOST_FUNCTION_RESOURCE_LIMIT_EXCEEDED = -3,
 *     INVOKE_HOST_FUNCTION_ENTRY_ARCHIVED = -4,
 *     INVOKE_HOST_FUNCTION_INSUFFICIENT_REFUNDABLE_FEE = -5
 * };
 * ```
 */
export class InvokeHostFunctionResultCode extends EnumValue<InvokeHostFunctionResultCodeName> {
  static readonly invokeHostFunctionSuccess = new InvokeHostFunctionResultCode(
    "invokeHostFunctionSuccess",
    0,
  );
  static readonly invokeHostFunctionMalformed =
    new InvokeHostFunctionResultCode("invokeHostFunctionMalformed", -1);
  static readonly invokeHostFunctionTrapped = new InvokeHostFunctionResultCode(
    "invokeHostFunctionTrapped",
    -2,
  );
  static readonly invokeHostFunctionResourceLimitExceeded =
    new InvokeHostFunctionResultCode(
      "invokeHostFunctionResourceLimitExceeded",
      -3,
    );
  static readonly invokeHostFunctionEntryArchived =
    new InvokeHostFunctionResultCode("invokeHostFunctionEntryArchived", -4);
  static readonly invokeHostFunctionInsufficientRefundableFee =
    new InvokeHostFunctionResultCode(
      "invokeHostFunctionInsufficientRefundableFee",
      -5,
    );

  static readonly schema = enumType("InvokeHostFunctionResultCode", {
    invokeHostFunctionSuccess: 0,
    invokeHostFunctionMalformed: -1,
    invokeHostFunctionTrapped: -2,
    invokeHostFunctionResourceLimitExceeded: -3,
    invokeHostFunctionEntryArchived: -4,
    invokeHostFunctionInsufficientRefundableFee: -5,
  });

  static fromValue(value: number): InvokeHostFunctionResultCode {
    return enumFromValue(
      "InvokeHostFunctionResultCode",
      InvokeHostFunctionResultCode.schema,
      InvokeHostFunctionResultCode,
      value,
    );
  }

  static fromName(
    name: InvokeHostFunctionResultCodeName,
  ): InvokeHostFunctionResultCode {
    return enumFromName(
      "InvokeHostFunctionResultCode",
      InvokeHostFunctionResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): InvokeHostFunctionResultCode {
    return InvokeHostFunctionResultCode.fromValue(wire);
  }
}
