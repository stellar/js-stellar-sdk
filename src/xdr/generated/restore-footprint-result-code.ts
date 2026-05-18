import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type RestoreFootprintResultCodeWire = number;

export type RestoreFootprintResultCodeName =
  | "restoreFootprintSuccess"
  | "restoreFootprintMalformed"
  | "restoreFootprintResourceLimitExceeded"
  | "restoreFootprintInsufficientRefundableFee";

/**
 * ```xdr
 * enum RestoreFootprintResultCode
 * {
 *     // codes considered as "success" for the operation
 *     RESTORE_FOOTPRINT_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     RESTORE_FOOTPRINT_MALFORMED = -1,
 *     RESTORE_FOOTPRINT_RESOURCE_LIMIT_EXCEEDED = -2,
 *     RESTORE_FOOTPRINT_INSUFFICIENT_REFUNDABLE_FEE = -3
 * };
 * ```
 */
export class RestoreFootprintResultCode extends EnumValue<RestoreFootprintResultCodeName> {
  static readonly restoreFootprintSuccess = new RestoreFootprintResultCode(
    "restoreFootprintSuccess",
    0,
  );
  static readonly restoreFootprintMalformed = new RestoreFootprintResultCode(
    "restoreFootprintMalformed",
    -1,
  );
  static readonly restoreFootprintResourceLimitExceeded =
    new RestoreFootprintResultCode("restoreFootprintResourceLimitExceeded", -2);
  static readonly restoreFootprintInsufficientRefundableFee =
    new RestoreFootprintResultCode(
      "restoreFootprintInsufficientRefundableFee",
      -3,
    );

  private static readonly byValue: Readonly<
    Record<number, RestoreFootprintResultCode>
  > = {
    0: RestoreFootprintResultCode.restoreFootprintSuccess,
    "-1": RestoreFootprintResultCode.restoreFootprintMalformed,
    "-2": RestoreFootprintResultCode.restoreFootprintResourceLimitExceeded,
    "-3": RestoreFootprintResultCode.restoreFootprintInsufficientRefundableFee,
  };

  static readonly schema = enumType("RestoreFootprintResultCode", {
    restoreFootprintSuccess: 0,
    restoreFootprintMalformed: -1,
    restoreFootprintResourceLimitExceeded: -2,
    restoreFootprintInsufficientRefundableFee: -3,
  });

  static fromValue(value: number): RestoreFootprintResultCode {
    return enumLookup(
      "RestoreFootprintResultCode",
      RestoreFootprintResultCode.byValue,
      value,
    ) as RestoreFootprintResultCode;
  }

  static fromName(
    name: RestoreFootprintResultCodeName,
  ): RestoreFootprintResultCode {
    switch (name) {
      case "restoreFootprintSuccess":
        return RestoreFootprintResultCode.restoreFootprintSuccess;
      case "restoreFootprintMalformed":
        return RestoreFootprintResultCode.restoreFootprintMalformed;
      case "restoreFootprintResourceLimitExceeded":
        return RestoreFootprintResultCode.restoreFootprintResourceLimitExceeded;
      case "restoreFootprintInsufficientRefundableFee":
        return RestoreFootprintResultCode.restoreFootprintInsufficientRefundableFee;
      default:
        throw new XdrError(`RestoreFootprintResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): RestoreFootprintResultCode {
    return RestoreFootprintResultCode.fromValue(wire);
  }
}
