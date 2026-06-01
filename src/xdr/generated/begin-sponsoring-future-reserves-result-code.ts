import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("BeginSponsoringFutureReservesResultCode", {
      beginSponsoringFutureReservesSuccess: 0,
      beginSponsoringFutureReservesMalformed: -1,
      beginSponsoringFutureReservesAlreadySponsored: -2,
      beginSponsoringFutureReservesRecursive: -3,
    }),
    "beginSponsoringFutureReserves",
  );

  static fromValue(value: number): BeginSponsoringFutureReservesResultCode {
    return enumFromValue(
      "BeginSponsoringFutureReservesResultCode",
      BeginSponsoringFutureReservesResultCode.schema,
      BeginSponsoringFutureReservesResultCode,
      value,
    );
  }

  static fromName(
    name: BeginSponsoringFutureReservesResultCodeName,
  ): BeginSponsoringFutureReservesResultCode {
    return enumFromName(
      "BeginSponsoringFutureReservesResultCode",
      BeginSponsoringFutureReservesResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): BeginSponsoringFutureReservesResultCode {
    return BeginSponsoringFutureReservesResultCode.fromValue(wire);
  }
}
