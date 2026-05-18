import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type RevokeSponsorshipResultCodeWire = number;

export type RevokeSponsorshipResultCodeName =
  | "revokeSponsorshipSuccess"
  | "revokeSponsorshipDoesNotExist"
  | "revokeSponsorshipNotSponsor"
  | "revokeSponsorshipLowReserve"
  | "revokeSponsorshipOnlyTransferable"
  | "revokeSponsorshipMalformed";

/**
 * ```xdr
 * enum RevokeSponsorshipResultCode
 * {
 *     // codes considered as "success" for the operation
 *     REVOKE_SPONSORSHIP_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     REVOKE_SPONSORSHIP_DOES_NOT_EXIST = -1,
 *     REVOKE_SPONSORSHIP_NOT_SPONSOR = -2,
 *     REVOKE_SPONSORSHIP_LOW_RESERVE = -3,
 *     REVOKE_SPONSORSHIP_ONLY_TRANSFERABLE = -4,
 *     REVOKE_SPONSORSHIP_MALFORMED = -5
 * };
 * ```
 */
export class RevokeSponsorshipResultCode extends EnumValue<RevokeSponsorshipResultCodeName> {
  static readonly revokeSponsorshipSuccess = new RevokeSponsorshipResultCode(
    "revokeSponsorshipSuccess",
    0,
  );
  static readonly revokeSponsorshipDoesNotExist =
    new RevokeSponsorshipResultCode("revokeSponsorshipDoesNotExist", -1);
  static readonly revokeSponsorshipNotSponsor = new RevokeSponsorshipResultCode(
    "revokeSponsorshipNotSponsor",
    -2,
  );
  static readonly revokeSponsorshipLowReserve = new RevokeSponsorshipResultCode(
    "revokeSponsorshipLowReserve",
    -3,
  );
  static readonly revokeSponsorshipOnlyTransferable =
    new RevokeSponsorshipResultCode("revokeSponsorshipOnlyTransferable", -4);
  static readonly revokeSponsorshipMalformed = new RevokeSponsorshipResultCode(
    "revokeSponsorshipMalformed",
    -5,
  );

  private static readonly byValue: Readonly<
    Record<number, RevokeSponsorshipResultCode>
  > = {
    0: RevokeSponsorshipResultCode.revokeSponsorshipSuccess,
    "-1": RevokeSponsorshipResultCode.revokeSponsorshipDoesNotExist,
    "-2": RevokeSponsorshipResultCode.revokeSponsorshipNotSponsor,
    "-3": RevokeSponsorshipResultCode.revokeSponsorshipLowReserve,
    "-4": RevokeSponsorshipResultCode.revokeSponsorshipOnlyTransferable,
    "-5": RevokeSponsorshipResultCode.revokeSponsorshipMalformed,
  };

  static readonly schema = enumType("RevokeSponsorshipResultCode", {
    revokeSponsorshipSuccess: 0,
    revokeSponsorshipDoesNotExist: -1,
    revokeSponsorshipNotSponsor: -2,
    revokeSponsorshipLowReserve: -3,
    revokeSponsorshipOnlyTransferable: -4,
    revokeSponsorshipMalformed: -5,
  });

  static fromValue(value: number): RevokeSponsorshipResultCode {
    return enumLookup(
      "RevokeSponsorshipResultCode",
      RevokeSponsorshipResultCode.byValue,
      value,
    ) as RevokeSponsorshipResultCode;
  }

  static fromName(
    name: RevokeSponsorshipResultCodeName,
  ): RevokeSponsorshipResultCode {
    switch (name) {
      case "revokeSponsorshipSuccess":
        return RevokeSponsorshipResultCode.revokeSponsorshipSuccess;
      case "revokeSponsorshipDoesNotExist":
        return RevokeSponsorshipResultCode.revokeSponsorshipDoesNotExist;
      case "revokeSponsorshipNotSponsor":
        return RevokeSponsorshipResultCode.revokeSponsorshipNotSponsor;
      case "revokeSponsorshipLowReserve":
        return RevokeSponsorshipResultCode.revokeSponsorshipLowReserve;
      case "revokeSponsorshipOnlyTransferable":
        return RevokeSponsorshipResultCode.revokeSponsorshipOnlyTransferable;
      case "revokeSponsorshipMalformed":
        return RevokeSponsorshipResultCode.revokeSponsorshipMalformed;
      default:
        throw new XdrError(`RevokeSponsorshipResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): RevokeSponsorshipResultCode {
    return RevokeSponsorshipResultCode.fromValue(wire);
  }
}
