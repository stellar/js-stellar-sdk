import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type EndSponsoringFutureReservesResultCodeWire = number;

export type EndSponsoringFutureReservesResultCodeName =
  | "endSponsoringFutureReservesSuccess"
  | "endSponsoringFutureReservesNotSponsored";

/**
 * ```xdr
 * enum EndSponsoringFutureReservesResultCode
 * {
 *     // codes considered as "success" for the operation
 *     END_SPONSORING_FUTURE_RESERVES_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     END_SPONSORING_FUTURE_RESERVES_NOT_SPONSORED = -1
 * };
 * ```
 */
export class EndSponsoringFutureReservesResultCode extends EnumValue<EndSponsoringFutureReservesResultCodeName> {
  static readonly endSponsoringFutureReservesSuccess =
    new EndSponsoringFutureReservesResultCode(
      "endSponsoringFutureReservesSuccess",
      0,
    );
  static readonly endSponsoringFutureReservesNotSponsored =
    new EndSponsoringFutureReservesResultCode(
      "endSponsoringFutureReservesNotSponsored",
      -1,
    );

  static readonly schema = withMemberPrefix(
    enumType("EndSponsoringFutureReservesResultCode", {
      endSponsoringFutureReservesSuccess: 0,
      endSponsoringFutureReservesNotSponsored: -1,
    }),
    "endSponsoringFutureReserves",
  );

  static fromValue(value: number): EndSponsoringFutureReservesResultCode {
    return enumFromValue(
      "EndSponsoringFutureReservesResultCode",
      EndSponsoringFutureReservesResultCode.schema,
      EndSponsoringFutureReservesResultCode,
      value,
    );
  }

  static fromName(
    name: EndSponsoringFutureReservesResultCodeName,
  ): EndSponsoringFutureReservesResultCode {
    return enumFromName(
      "EndSponsoringFutureReservesResultCode",
      EndSponsoringFutureReservesResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): EndSponsoringFutureReservesResultCode {
    return EndSponsoringFutureReservesResultCode.fromValue(wire);
  }
}
