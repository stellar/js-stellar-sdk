import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ManageDataResultCodeWire = number;

export type ManageDataResultCodeName =
  | "manageDataSuccess"
  | "manageDataNotSupportedYet"
  | "manageDataNameNotFound"
  | "manageDataLowReserve"
  | "manageDataInvalidName";

/**
 * ```xdr
 * enum ManageDataResultCode
 * {
 *     // codes considered as "success" for the operation
 *     MANAGE_DATA_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     MANAGE_DATA_NOT_SUPPORTED_YET =
 *         -1, // The network hasn't moved to this protocol change yet
 *     MANAGE_DATA_NAME_NOT_FOUND =
 *         -2, // Trying to remove a Data Entry that isn't there
 *     MANAGE_DATA_LOW_RESERVE = -3, // not enough funds to create a new Data Entry
 *     MANAGE_DATA_INVALID_NAME = -4 // Name not a valid string
 * };
 * ```
 */
export class ManageDataResultCode extends EnumValue<ManageDataResultCodeName> {
  static readonly manageDataSuccess = new ManageDataResultCode(
    "manageDataSuccess",
    0,
  );
  static readonly manageDataNotSupportedYet = new ManageDataResultCode(
    "manageDataNotSupportedYet",
    -1,
  );
  static readonly manageDataNameNotFound = new ManageDataResultCode(
    "manageDataNameNotFound",
    -2,
  );
  static readonly manageDataLowReserve = new ManageDataResultCode(
    "manageDataLowReserve",
    -3,
  );
  static readonly manageDataInvalidName = new ManageDataResultCode(
    "manageDataInvalidName",
    -4,
  );

  private static readonly byValue: Readonly<
    Record<number, ManageDataResultCode>
  > = {
    0: ManageDataResultCode.manageDataSuccess,
    "-1": ManageDataResultCode.manageDataNotSupportedYet,
    "-2": ManageDataResultCode.manageDataNameNotFound,
    "-3": ManageDataResultCode.manageDataLowReserve,
    "-4": ManageDataResultCode.manageDataInvalidName,
  };

  static readonly schema = enumType("ManageDataResultCode", {
    manageDataSuccess: 0,
    manageDataNotSupportedYet: -1,
    manageDataNameNotFound: -2,
    manageDataLowReserve: -3,
    manageDataInvalidName: -4,
  });

  static fromValue(value: number): ManageDataResultCode {
    return enumLookup(
      "ManageDataResultCode",
      ManageDataResultCode.byValue,
      value,
    ) as ManageDataResultCode;
  }

  static fromName(name: ManageDataResultCodeName): ManageDataResultCode {
    switch (name) {
      case "manageDataSuccess":
        return ManageDataResultCode.manageDataSuccess;
      case "manageDataNotSupportedYet":
        return ManageDataResultCode.manageDataNotSupportedYet;
      case "manageDataNameNotFound":
        return ManageDataResultCode.manageDataNameNotFound;
      case "manageDataLowReserve":
        return ManageDataResultCode.manageDataLowReserve;
      case "manageDataInvalidName":
        return ManageDataResultCode.manageDataInvalidName;
      default:
        throw new XdrError(`ManageDataResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ManageDataResultCode {
    return ManageDataResultCode.fromValue(wire);
  }
}
