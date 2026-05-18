import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type OperationResultCodeWire = number;

export type OperationResultCodeName =
  | "opInner"
  | "opBadAuth"
  | "opNoAccount"
  | "opNotSupported"
  | "opTooManySubentries"
  | "opExceededWorkLimit"
  | "opTooManySponsoring";

/**
 * ```xdr
 * enum OperationResultCode
 * {
 *     opINNER = 0, // inner object result is valid
 *
 *     opBAD_AUTH = -1,            // too few valid signatures / wrong network
 *     opNO_ACCOUNT = -2,          // source account was not found
 *     opNOT_SUPPORTED = -3,       // operation not supported at this time
 *     opTOO_MANY_SUBENTRIES = -4, // max number of subentries already reached
 *     opEXCEEDED_WORK_LIMIT = -5, // operation did too much work
 *     opTOO_MANY_SPONSORING = -6  // account is sponsoring too many entries
 * };
 * ```
 */
export class OperationResultCode extends EnumValue<OperationResultCodeName> {
  static readonly opInner = new OperationResultCode("opInner", 0);
  static readonly opBadAuth = new OperationResultCode("opBadAuth", -1);
  static readonly opNoAccount = new OperationResultCode("opNoAccount", -2);
  static readonly opNotSupported = new OperationResultCode(
    "opNotSupported",
    -3,
  );
  static readonly opTooManySubentries = new OperationResultCode(
    "opTooManySubentries",
    -4,
  );
  static readonly opExceededWorkLimit = new OperationResultCode(
    "opExceededWorkLimit",
    -5,
  );
  static readonly opTooManySponsoring = new OperationResultCode(
    "opTooManySponsoring",
    -6,
  );

  private static readonly byValue: Readonly<
    Record<number, OperationResultCode>
  > = {
    0: OperationResultCode.opInner,
    "-1": OperationResultCode.opBadAuth,
    "-2": OperationResultCode.opNoAccount,
    "-3": OperationResultCode.opNotSupported,
    "-4": OperationResultCode.opTooManySubentries,
    "-5": OperationResultCode.opExceededWorkLimit,
    "-6": OperationResultCode.opTooManySponsoring,
  };

  static readonly schema = enumType("OperationResultCode", {
    opInner: 0,
    opBadAuth: -1,
    opNoAccount: -2,
    opNotSupported: -3,
    opTooManySubentries: -4,
    opExceededWorkLimit: -5,
    opTooManySponsoring: -6,
  });

  static fromValue(value: number): OperationResultCode {
    return enumLookup(
      "OperationResultCode",
      OperationResultCode.byValue,
      value,
    ) as OperationResultCode;
  }

  static fromName(name: OperationResultCodeName): OperationResultCode {
    switch (name) {
      case "opInner":
        return OperationResultCode.opInner;
      case "opBadAuth":
        return OperationResultCode.opBadAuth;
      case "opNoAccount":
        return OperationResultCode.opNoAccount;
      case "opNotSupported":
        return OperationResultCode.opNotSupported;
      case "opTooManySubentries":
        return OperationResultCode.opTooManySubentries;
      case "opExceededWorkLimit":
        return OperationResultCode.opExceededWorkLimit;
      case "opTooManySponsoring":
        return OperationResultCode.opTooManySponsoring;
      default:
        throw new XdrError(`OperationResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): OperationResultCode {
    return OperationResultCode.fromValue(wire);
  }
}
