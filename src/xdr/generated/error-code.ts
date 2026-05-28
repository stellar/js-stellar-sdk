import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ErrorCode", {
    errMisc: 0,
    errData: 1,
    errConf: 2,
    errAuth: 3,
    errLoad: 4,
  });

  static fromValue(value: number): ErrorCode {
    return enumFromValue("ErrorCode", ErrorCode.schema, ErrorCode, value);
  }

  static fromName(name: ErrorCodeName): ErrorCode {
    return enumFromName("ErrorCode", ErrorCode, name);
  }

  static fromXdrObject(wire: number): ErrorCode {
    return ErrorCode.fromValue(wire);
  }
}
