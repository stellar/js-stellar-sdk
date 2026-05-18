import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ExtendFootprintTtlResultCodeWire = number;

export type ExtendFootprintTtlResultCodeName =
  | "extendFootprintTtlSuccess"
  | "extendFootprintTtlMalformed"
  | "extendFootprintTtlResourceLimitExceeded"
  | "extendFootprintTtlInsufficientRefundableFee";

/**
 * ```xdr
 * enum ExtendFootprintTTLResultCode
 * {
 *     // codes considered as "success" for the operation
 *     EXTEND_FOOTPRINT_TTL_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     EXTEND_FOOTPRINT_TTL_MALFORMED = -1,
 *     EXTEND_FOOTPRINT_TTL_RESOURCE_LIMIT_EXCEEDED = -2,
 *     EXTEND_FOOTPRINT_TTL_INSUFFICIENT_REFUNDABLE_FEE = -3
 * };
 * ```
 */
export class ExtendFootprintTtlResultCode extends EnumValue<ExtendFootprintTtlResultCodeName> {
  static readonly extendFootprintTtlSuccess = new ExtendFootprintTtlResultCode(
    "extendFootprintTtlSuccess",
    0,
  );
  static readonly extendFootprintTtlMalformed =
    new ExtendFootprintTtlResultCode("extendFootprintTtlMalformed", -1);
  static readonly extendFootprintTtlResourceLimitExceeded =
    new ExtendFootprintTtlResultCode(
      "extendFootprintTtlResourceLimitExceeded",
      -2,
    );
  static readonly extendFootprintTtlInsufficientRefundableFee =
    new ExtendFootprintTtlResultCode(
      "extendFootprintTtlInsufficientRefundableFee",
      -3,
    );

  private static readonly byValue: Readonly<
    Record<number, ExtendFootprintTtlResultCode>
  > = {
    0: ExtendFootprintTtlResultCode.extendFootprintTtlSuccess,
    "-1": ExtendFootprintTtlResultCode.extendFootprintTtlMalformed,
    "-2": ExtendFootprintTtlResultCode.extendFootprintTtlResourceLimitExceeded,
    "-3": ExtendFootprintTtlResultCode.extendFootprintTtlInsufficientRefundableFee,
  };

  static readonly schema = enumType("ExtendFootprintTtlResultCode", {
    extendFootprintTtlSuccess: 0,
    extendFootprintTtlMalformed: -1,
    extendFootprintTtlResourceLimitExceeded: -2,
    extendFootprintTtlInsufficientRefundableFee: -3,
  });

  static fromValue(value: number): ExtendFootprintTtlResultCode {
    return enumLookup(
      "ExtendFootprintTtlResultCode",
      ExtendFootprintTtlResultCode.byValue,
      value,
    ) as ExtendFootprintTtlResultCode;
  }

  static fromName(
    name: ExtendFootprintTtlResultCodeName,
  ): ExtendFootprintTtlResultCode {
    switch (name) {
      case "extendFootprintTtlSuccess":
        return ExtendFootprintTtlResultCode.extendFootprintTtlSuccess;
      case "extendFootprintTtlMalformed":
        return ExtendFootprintTtlResultCode.extendFootprintTtlMalformed;
      case "extendFootprintTtlResourceLimitExceeded":
        return ExtendFootprintTtlResultCode.extendFootprintTtlResourceLimitExceeded;
      case "extendFootprintTtlInsufficientRefundableFee":
        return ExtendFootprintTtlResultCode.extendFootprintTtlInsufficientRefundableFee;
      default:
        throw new XdrError(
          `ExtendFootprintTtlResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): ExtendFootprintTtlResultCode {
    return ExtendFootprintTtlResultCode.fromValue(wire);
  }
}
