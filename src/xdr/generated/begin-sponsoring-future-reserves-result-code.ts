import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type BeginSponsoringFutureReservesResultCodeWire = number;

export type BeginSponsoringFutureReservesResultCodeName =
  | "beginSponsoringFutureReservesSuccess"
  | "beginSponsoringFutureReservesMalformed"
  | "beginSponsoringFutureReservesAlreadySponsored"
  | "beginSponsoringFutureReservesRecursive";

/**
 * ```xdr
 * enum BeginSponsoringFutureReservesResultCode
 * {
 *     // codes considered as "success" for the operation
 *     BEGIN_SPONSORING_FUTURE_RESERVES_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     BEGIN_SPONSORING_FUTURE_RESERVES_MALFORMED = -1,
 *     BEGIN_SPONSORING_FUTURE_RESERVES_ALREADY_SPONSORED = -2,
 *     BEGIN_SPONSORING_FUTURE_RESERVES_RECURSIVE = -3
 * };
 * ```
 */
export class BeginSponsoringFutureReservesResultCode extends EnumValue<BeginSponsoringFutureReservesResultCodeName> {
  static readonly beginSponsoringFutureReservesSuccess =
    new BeginSponsoringFutureReservesResultCode(
      "beginSponsoringFutureReservesSuccess",
      0,
    );
  static readonly beginSponsoringFutureReservesMalformed =
    new BeginSponsoringFutureReservesResultCode(
      "beginSponsoringFutureReservesMalformed",
      -1,
    );
  static readonly beginSponsoringFutureReservesAlreadySponsored =
    new BeginSponsoringFutureReservesResultCode(
      "beginSponsoringFutureReservesAlreadySponsored",
      -2,
    );
  static readonly beginSponsoringFutureReservesRecursive =
    new BeginSponsoringFutureReservesResultCode(
      "beginSponsoringFutureReservesRecursive",
      -3,
    );

  private static readonly byValue: Readonly<
    Record<number, BeginSponsoringFutureReservesResultCode>
  > = {
    0: BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesSuccess,
    "-1": BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesMalformed,
    "-2": BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesAlreadySponsored,
    "-3": BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesRecursive,
  };

  static readonly schema = enumType("BeginSponsoringFutureReservesResultCode", {
    beginSponsoringFutureReservesSuccess: 0,
    beginSponsoringFutureReservesMalformed: -1,
    beginSponsoringFutureReservesAlreadySponsored: -2,
    beginSponsoringFutureReservesRecursive: -3,
  });

  static fromValue(value: number): BeginSponsoringFutureReservesResultCode {
    return enumLookup(
      "BeginSponsoringFutureReservesResultCode",
      BeginSponsoringFutureReservesResultCode.byValue,
      value,
    ) as BeginSponsoringFutureReservesResultCode;
  }

  static fromName(
    name: BeginSponsoringFutureReservesResultCodeName,
  ): BeginSponsoringFutureReservesResultCode {
    switch (name) {
      case "beginSponsoringFutureReservesSuccess":
        return BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesSuccess;
      case "beginSponsoringFutureReservesMalformed":
        return BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesMalformed;
      case "beginSponsoringFutureReservesAlreadySponsored":
        return BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesAlreadySponsored;
      case "beginSponsoringFutureReservesRecursive":
        return BeginSponsoringFutureReservesResultCode.beginSponsoringFutureReservesRecursive;
      default:
        throw new XdrError(
          `BeginSponsoringFutureReservesResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): BeginSponsoringFutureReservesResultCode {
    return BeginSponsoringFutureReservesResultCode.fromValue(wire);
  }
}
