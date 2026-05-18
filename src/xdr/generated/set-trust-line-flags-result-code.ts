import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type SetTrustLineFlagsResultCodeWire = number;

export type SetTrustLineFlagsResultCodeName =
  | "setTrustLineFlagsSuccess"
  | "setTrustLineFlagsMalformed"
  | "setTrustLineFlagsNoTrustLine"
  | "setTrustLineFlagsCantRevoke"
  | "setTrustLineFlagsInvalidState"
  | "setTrustLineFlagsLowReserve";

/**
 * ```xdr
 * enum SetTrustLineFlagsResultCode
 * {
 *     // codes considered as "success" for the operation
 *     SET_TRUST_LINE_FLAGS_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     SET_TRUST_LINE_FLAGS_MALFORMED = -1,
 *     SET_TRUST_LINE_FLAGS_NO_TRUST_LINE = -2,
 *     SET_TRUST_LINE_FLAGS_CANT_REVOKE = -3,
 *     SET_TRUST_LINE_FLAGS_INVALID_STATE = -4,
 *     SET_TRUST_LINE_FLAGS_LOW_RESERVE = -5 // claimable balances can't be created
 *                                           // on revoke due to low reserves
 * };
 * ```
 */
export class SetTrustLineFlagsResultCode extends EnumValue<SetTrustLineFlagsResultCodeName> {
  static readonly setTrustLineFlagsSuccess = new SetTrustLineFlagsResultCode(
    "setTrustLineFlagsSuccess",
    0,
  );
  static readonly setTrustLineFlagsMalformed = new SetTrustLineFlagsResultCode(
    "setTrustLineFlagsMalformed",
    -1,
  );
  static readonly setTrustLineFlagsNoTrustLine =
    new SetTrustLineFlagsResultCode("setTrustLineFlagsNoTrustLine", -2);
  static readonly setTrustLineFlagsCantRevoke = new SetTrustLineFlagsResultCode(
    "setTrustLineFlagsCantRevoke",
    -3,
  );
  static readonly setTrustLineFlagsInvalidState =
    new SetTrustLineFlagsResultCode("setTrustLineFlagsInvalidState", -4);
  static readonly setTrustLineFlagsLowReserve = new SetTrustLineFlagsResultCode(
    "setTrustLineFlagsLowReserve",
    -5,
  );

  private static readonly byValue: Readonly<
    Record<number, SetTrustLineFlagsResultCode>
  > = {
    0: SetTrustLineFlagsResultCode.setTrustLineFlagsSuccess,
    "-1": SetTrustLineFlagsResultCode.setTrustLineFlagsMalformed,
    "-2": SetTrustLineFlagsResultCode.setTrustLineFlagsNoTrustLine,
    "-3": SetTrustLineFlagsResultCode.setTrustLineFlagsCantRevoke,
    "-4": SetTrustLineFlagsResultCode.setTrustLineFlagsInvalidState,
    "-5": SetTrustLineFlagsResultCode.setTrustLineFlagsLowReserve,
  };

  static readonly schema = enumType("SetTrustLineFlagsResultCode", {
    setTrustLineFlagsSuccess: 0,
    setTrustLineFlagsMalformed: -1,
    setTrustLineFlagsNoTrustLine: -2,
    setTrustLineFlagsCantRevoke: -3,
    setTrustLineFlagsInvalidState: -4,
    setTrustLineFlagsLowReserve: -5,
  });

  static fromValue(value: number): SetTrustLineFlagsResultCode {
    return enumLookup(
      "SetTrustLineFlagsResultCode",
      SetTrustLineFlagsResultCode.byValue,
      value,
    ) as SetTrustLineFlagsResultCode;
  }

  static fromName(
    name: SetTrustLineFlagsResultCodeName,
  ): SetTrustLineFlagsResultCode {
    switch (name) {
      case "setTrustLineFlagsSuccess":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsSuccess;
      case "setTrustLineFlagsMalformed":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsMalformed;
      case "setTrustLineFlagsNoTrustLine":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsNoTrustLine;
      case "setTrustLineFlagsCantRevoke":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsCantRevoke;
      case "setTrustLineFlagsInvalidState":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsInvalidState;
      case "setTrustLineFlagsLowReserve":
        return SetTrustLineFlagsResultCode.setTrustLineFlagsLowReserve;
      default:
        throw new XdrError(`SetTrustLineFlagsResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): SetTrustLineFlagsResultCode {
    return SetTrustLineFlagsResultCode.fromValue(wire);
  }
}
