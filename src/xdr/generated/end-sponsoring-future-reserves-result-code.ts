import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, EndSponsoringFutureReservesResultCode>
  > = {
    0: EndSponsoringFutureReservesResultCode.endSponsoringFutureReservesSuccess,
    "-1": EndSponsoringFutureReservesResultCode.endSponsoringFutureReservesNotSponsored,
  };

  static readonly schema = enumType("EndSponsoringFutureReservesResultCode", {
    endSponsoringFutureReservesSuccess: 0,
    endSponsoringFutureReservesNotSponsored: -1,
  });

  static fromValue(value: number): EndSponsoringFutureReservesResultCode {
    return enumLookup(
      "EndSponsoringFutureReservesResultCode",
      EndSponsoringFutureReservesResultCode.byValue,
      value,
    ) as EndSponsoringFutureReservesResultCode;
  }

  static fromName(
    name: EndSponsoringFutureReservesResultCodeName,
  ): EndSponsoringFutureReservesResultCode {
    switch (name) {
      case "endSponsoringFutureReservesSuccess":
        return EndSponsoringFutureReservesResultCode.endSponsoringFutureReservesSuccess;
      case "endSponsoringFutureReservesNotSponsored":
        return EndSponsoringFutureReservesResultCode.endSponsoringFutureReservesNotSponsored;
      default:
        throw new XdrError(
          `EndSponsoringFutureReservesResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): EndSponsoringFutureReservesResultCode {
    return EndSponsoringFutureReservesResultCode.fromValue(wire);
  }
}
