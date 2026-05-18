import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ErrorCodeWire = number;

export type ErrorCodeName =
  | "errMisc"
  | "errData"
  | "errConf"
  | "errAuth"
  | "errLoad";

/**
 * ```xdr
 * enum ErrorCode
 * {
 *     ERR_MISC = 0, // Unspecific error
 *     ERR_DATA = 1, // Malformed data
 *     ERR_CONF = 2, // Misconfiguration error
 *     ERR_AUTH = 3, // Authentication failure
 *     ERR_LOAD = 4  // System overloaded
 * };
 * ```
 */
export class ErrorCode extends EnumValue<ErrorCodeName> {
  static readonly errMisc = new ErrorCode("errMisc", 0);
  static readonly errData = new ErrorCode("errData", 1);
  static readonly errConf = new ErrorCode("errConf", 2);
  static readonly errAuth = new ErrorCode("errAuth", 3);
  static readonly errLoad = new ErrorCode("errLoad", 4);

  private static readonly byValue: Readonly<Record<number, ErrorCode>> = {
    0: ErrorCode.errMisc,
    1: ErrorCode.errData,
    2: ErrorCode.errConf,
    3: ErrorCode.errAuth,
    4: ErrorCode.errLoad,
  };

  static readonly schema = enumType("ErrorCode", {
    errMisc: 0,
    errData: 1,
    errConf: 2,
    errAuth: 3,
    errLoad: 4,
  });

  static fromValue(value: number): ErrorCode {
    return enumLookup("ErrorCode", ErrorCode.byValue, value) as ErrorCode;
  }

  static fromName(name: ErrorCodeName): ErrorCode {
    switch (name) {
      case "errMisc":
        return ErrorCode.errMisc;
      case "errData":
        return ErrorCode.errData;
      case "errConf":
        return ErrorCode.errConf;
      case "errAuth":
        return ErrorCode.errAuth;
      case "errLoad":
        return ErrorCode.errLoad;
      default:
        throw new XdrError(`ErrorCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ErrorCode {
    return ErrorCode.fromValue(wire);
  }
}
