import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, InvokeHostFunctionResultCode>
  > = {
    0: InvokeHostFunctionResultCode.invokeHostFunctionSuccess,
    "-1": InvokeHostFunctionResultCode.invokeHostFunctionMalformed,
    "-2": InvokeHostFunctionResultCode.invokeHostFunctionTrapped,
    "-3": InvokeHostFunctionResultCode.invokeHostFunctionResourceLimitExceeded,
    "-4": InvokeHostFunctionResultCode.invokeHostFunctionEntryArchived,
    "-5": InvokeHostFunctionResultCode.invokeHostFunctionInsufficientRefundableFee,
  };

  static readonly schema = enumType("InvokeHostFunctionResultCode", {
    invokeHostFunctionSuccess: 0,
    invokeHostFunctionMalformed: -1,
    invokeHostFunctionTrapped: -2,
    invokeHostFunctionResourceLimitExceeded: -3,
    invokeHostFunctionEntryArchived: -4,
    invokeHostFunctionInsufficientRefundableFee: -5,
  });

  static fromValue(value: number): InvokeHostFunctionResultCode {
    return enumLookup(
      "InvokeHostFunctionResultCode",
      InvokeHostFunctionResultCode.byValue,
      value,
    ) as InvokeHostFunctionResultCode;
  }

  static fromName(
    name: InvokeHostFunctionResultCodeName,
  ): InvokeHostFunctionResultCode {
    switch (name) {
      case "invokeHostFunctionSuccess":
        return InvokeHostFunctionResultCode.invokeHostFunctionSuccess;
      case "invokeHostFunctionMalformed":
        return InvokeHostFunctionResultCode.invokeHostFunctionMalformed;
      case "invokeHostFunctionTrapped":
        return InvokeHostFunctionResultCode.invokeHostFunctionTrapped;
      case "invokeHostFunctionResourceLimitExceeded":
        return InvokeHostFunctionResultCode.invokeHostFunctionResourceLimitExceeded;
      case "invokeHostFunctionEntryArchived":
        return InvokeHostFunctionResultCode.invokeHostFunctionEntryArchived;
      case "invokeHostFunctionInsufficientRefundableFee":
        return InvokeHostFunctionResultCode.invokeHostFunctionInsufficientRefundableFee;
      default:
        throw new XdrError(
          `InvokeHostFunctionResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): InvokeHostFunctionResultCode {
    return InvokeHostFunctionResultCode.fromValue(wire);
  }
}
