import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScErrorCodeWire = number;

export type ScErrorCodeName =
  | "scecArithDomain"
  | "scecIndexBounds"
  | "scecInvalidInput"
  | "scecMissingValue"
  | "scecExistingValue"
  | "scecExceededLimit"
  | "scecInvalidAction"
  | "scecInternalError"
  | "scecUnexpectedType"
  | "scecUnexpectedSize";

/**
 * ```xdr
 * enum SCErrorCode
 * {
 *     SCEC_ARITH_DOMAIN = 0,      // Some arithmetic was undefined (overflow, divide-by-zero).
 *     SCEC_INDEX_BOUNDS = 1,      // Something was indexed beyond its bounds.
 *     SCEC_INVALID_INPUT = 2,     // User provided some otherwise-bad data.
 *     SCEC_MISSING_VALUE = 3,     // Some value was required but not provided.
 *     SCEC_EXISTING_VALUE = 4,    // Some value was provided where not allowed.
 *     SCEC_EXCEEDED_LIMIT = 5,    // Some arbitrary limit -- gas or otherwise -- was hit.
 *     SCEC_INVALID_ACTION = 6,    // Data was valid but action requested was not.
 *     SCEC_INTERNAL_ERROR = 7,    // The host detected an error in its own logic.
 *     SCEC_UNEXPECTED_TYPE = 8,   // Some type wasn't as expected.
 *     SCEC_UNEXPECTED_SIZE = 9    // Something's size wasn't as expected.
 * };
 * ```
 */
export class ScErrorCode extends EnumValue<ScErrorCodeName> {
  static readonly scecArithDomain = new ScErrorCode("scecArithDomain", 0);
  static readonly scecIndexBounds = new ScErrorCode("scecIndexBounds", 1);
  static readonly scecInvalidInput = new ScErrorCode("scecInvalidInput", 2);
  static readonly scecMissingValue = new ScErrorCode("scecMissingValue", 3);
  static readonly scecExistingValue = new ScErrorCode("scecExistingValue", 4);
  static readonly scecExceededLimit = new ScErrorCode("scecExceededLimit", 5);
  static readonly scecInvalidAction = new ScErrorCode("scecInvalidAction", 6);
  static readonly scecInternalError = new ScErrorCode("scecInternalError", 7);
  static readonly scecUnexpectedType = new ScErrorCode("scecUnexpectedType", 8);
  static readonly scecUnexpectedSize = new ScErrorCode("scecUnexpectedSize", 9);

  private static readonly byValue: Readonly<Record<number, ScErrorCode>> = {
    0: ScErrorCode.scecArithDomain,
    1: ScErrorCode.scecIndexBounds,
    2: ScErrorCode.scecInvalidInput,
    3: ScErrorCode.scecMissingValue,
    4: ScErrorCode.scecExistingValue,
    5: ScErrorCode.scecExceededLimit,
    6: ScErrorCode.scecInvalidAction,
    7: ScErrorCode.scecInternalError,
    8: ScErrorCode.scecUnexpectedType,
    9: ScErrorCode.scecUnexpectedSize,
  };

  static readonly schema = enumType("ScErrorCode", {
    scecArithDomain: 0,
    scecIndexBounds: 1,
    scecInvalidInput: 2,
    scecMissingValue: 3,
    scecExistingValue: 4,
    scecExceededLimit: 5,
    scecInvalidAction: 6,
    scecInternalError: 7,
    scecUnexpectedType: 8,
    scecUnexpectedSize: 9,
  });

  static fromValue(value: number): ScErrorCode {
    return enumLookup("ScErrorCode", ScErrorCode.byValue, value) as ScErrorCode;
  }

  static fromName(name: ScErrorCodeName): ScErrorCode {
    switch (name) {
      case "scecArithDomain":
        return ScErrorCode.scecArithDomain;
      case "scecIndexBounds":
        return ScErrorCode.scecIndexBounds;
      case "scecInvalidInput":
        return ScErrorCode.scecInvalidInput;
      case "scecMissingValue":
        return ScErrorCode.scecMissingValue;
      case "scecExistingValue":
        return ScErrorCode.scecExistingValue;
      case "scecExceededLimit":
        return ScErrorCode.scecExceededLimit;
      case "scecInvalidAction":
        return ScErrorCode.scecInvalidAction;
      case "scecInternalError":
        return ScErrorCode.scecInternalError;
      case "scecUnexpectedType":
        return ScErrorCode.scecUnexpectedType;
      case "scecUnexpectedSize":
        return ScErrorCode.scecUnexpectedSize;
      default:
        throw new XdrError(`ScErrorCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScErrorCode {
    return ScErrorCode.fromValue(wire);
  }
}
