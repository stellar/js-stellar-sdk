import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type SetOptionsResultCodeWire = number;

export type SetOptionsResultCodeName =
  | "setOptionsSuccess"
  | "setOptionsLowReserve"
  | "setOptionsTooManySigners"
  | "setOptionsBadFlags"
  | "setOptionsInvalidInflation"
  | "setOptionsCantChange"
  | "setOptionsUnknownFlag"
  | "setOptionsThresholdOutOfRange"
  | "setOptionsBadSigner"
  | "setOptionsInvalidHomeDomain"
  | "setOptionsAuthRevocableRequired";

/**
 * ```xdr
 * enum SetOptionsResultCode
 * {
 *     // codes considered as "success" for the operation
 *     SET_OPTIONS_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     SET_OPTIONS_LOW_RESERVE = -1,      // not enough funds to add a signer
 *     SET_OPTIONS_TOO_MANY_SIGNERS = -2, // max number of signers already reached
 *     SET_OPTIONS_BAD_FLAGS = -3,        // invalid combination of clear/set flags
 *     SET_OPTIONS_INVALID_INFLATION = -4,      // inflation account does not exist
 *     SET_OPTIONS_CANT_CHANGE = -5,            // can no longer change this option
 *     SET_OPTIONS_UNKNOWN_FLAG = -6,           // can't set an unknown flag
 *     SET_OPTIONS_THRESHOLD_OUT_OF_RANGE = -7, // bad value for weight/threshold
 *     SET_OPTIONS_BAD_SIGNER = -8,             // signer cannot be masterkey
 *     SET_OPTIONS_INVALID_HOME_DOMAIN = -9,    // malformed home domain
 *     SET_OPTIONS_AUTH_REVOCABLE_REQUIRED =
 *         -10 // auth revocable is required for clawback
 * };
 * ```
 */
export class SetOptionsResultCode extends EnumValue<SetOptionsResultCodeName> {
  static readonly setOptionsSuccess = new SetOptionsResultCode(
    "setOptionsSuccess",
    0,
  );
  static readonly setOptionsLowReserve = new SetOptionsResultCode(
    "setOptionsLowReserve",
    -1,
  );
  static readonly setOptionsTooManySigners = new SetOptionsResultCode(
    "setOptionsTooManySigners",
    -2,
  );
  static readonly setOptionsBadFlags = new SetOptionsResultCode(
    "setOptionsBadFlags",
    -3,
  );
  static readonly setOptionsInvalidInflation = new SetOptionsResultCode(
    "setOptionsInvalidInflation",
    -4,
  );
  static readonly setOptionsCantChange = new SetOptionsResultCode(
    "setOptionsCantChange",
    -5,
  );
  static readonly setOptionsUnknownFlag = new SetOptionsResultCode(
    "setOptionsUnknownFlag",
    -6,
  );
  static readonly setOptionsThresholdOutOfRange = new SetOptionsResultCode(
    "setOptionsThresholdOutOfRange",
    -7,
  );
  static readonly setOptionsBadSigner = new SetOptionsResultCode(
    "setOptionsBadSigner",
    -8,
  );
  static readonly setOptionsInvalidHomeDomain = new SetOptionsResultCode(
    "setOptionsInvalidHomeDomain",
    -9,
  );
  static readonly setOptionsAuthRevocableRequired = new SetOptionsResultCode(
    "setOptionsAuthRevocableRequired",
    -10,
  );

  private static readonly byValue: Readonly<
    Record<number, SetOptionsResultCode>
  > = {
    0: SetOptionsResultCode.setOptionsSuccess,
    "-1": SetOptionsResultCode.setOptionsLowReserve,
    "-2": SetOptionsResultCode.setOptionsTooManySigners,
    "-3": SetOptionsResultCode.setOptionsBadFlags,
    "-4": SetOptionsResultCode.setOptionsInvalidInflation,
    "-5": SetOptionsResultCode.setOptionsCantChange,
    "-6": SetOptionsResultCode.setOptionsUnknownFlag,
    "-7": SetOptionsResultCode.setOptionsThresholdOutOfRange,
    "-8": SetOptionsResultCode.setOptionsBadSigner,
    "-9": SetOptionsResultCode.setOptionsInvalidHomeDomain,
    "-10": SetOptionsResultCode.setOptionsAuthRevocableRequired,
  };

  static readonly schema = enumType("SetOptionsResultCode", {
    setOptionsSuccess: 0,
    setOptionsLowReserve: -1,
    setOptionsTooManySigners: -2,
    setOptionsBadFlags: -3,
    setOptionsInvalidInflation: -4,
    setOptionsCantChange: -5,
    setOptionsUnknownFlag: -6,
    setOptionsThresholdOutOfRange: -7,
    setOptionsBadSigner: -8,
    setOptionsInvalidHomeDomain: -9,
    setOptionsAuthRevocableRequired: -10,
  });

  static fromValue(value: number): SetOptionsResultCode {
    return enumLookup(
      "SetOptionsResultCode",
      SetOptionsResultCode.byValue,
      value,
    ) as SetOptionsResultCode;
  }

  static fromName(name: SetOptionsResultCodeName): SetOptionsResultCode {
    switch (name) {
      case "setOptionsSuccess":
        return SetOptionsResultCode.setOptionsSuccess;
      case "setOptionsLowReserve":
        return SetOptionsResultCode.setOptionsLowReserve;
      case "setOptionsTooManySigners":
        return SetOptionsResultCode.setOptionsTooManySigners;
      case "setOptionsBadFlags":
        return SetOptionsResultCode.setOptionsBadFlags;
      case "setOptionsInvalidInflation":
        return SetOptionsResultCode.setOptionsInvalidInflation;
      case "setOptionsCantChange":
        return SetOptionsResultCode.setOptionsCantChange;
      case "setOptionsUnknownFlag":
        return SetOptionsResultCode.setOptionsUnknownFlag;
      case "setOptionsThresholdOutOfRange":
        return SetOptionsResultCode.setOptionsThresholdOutOfRange;
      case "setOptionsBadSigner":
        return SetOptionsResultCode.setOptionsBadSigner;
      case "setOptionsInvalidHomeDomain":
        return SetOptionsResultCode.setOptionsInvalidHomeDomain;
      case "setOptionsAuthRevocableRequired":
        return SetOptionsResultCode.setOptionsAuthRevocableRequired;
      default:
        throw new XdrError(`SetOptionsResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): SetOptionsResultCode {
    return SetOptionsResultCode.fromValue(wire);
  }
}
