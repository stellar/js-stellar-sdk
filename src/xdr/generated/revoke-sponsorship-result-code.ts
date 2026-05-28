import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("RevokeSponsorshipResultCode", {
    revokeSponsorshipSuccess: 0,
    revokeSponsorshipDoesNotExist: -1,
    revokeSponsorshipNotSponsor: -2,
    revokeSponsorshipLowReserve: -3,
    revokeSponsorshipOnlyTransferable: -4,
    revokeSponsorshipMalformed: -5,
  });

  static fromValue(value: number): RevokeSponsorshipResultCode {
    return enumFromValue(
      "RevokeSponsorshipResultCode",
      RevokeSponsorshipResultCode.schema,
      RevokeSponsorshipResultCode,
      value,
    );
  }

  static fromName(
    name: RevokeSponsorshipResultCodeName,
  ): RevokeSponsorshipResultCode {
    return enumFromName(
      "RevokeSponsorshipResultCode",
      RevokeSponsorshipResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): RevokeSponsorshipResultCode {
    return RevokeSponsorshipResultCode.fromValue(wire);
  }
}
