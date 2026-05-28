import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ChangeTrustResultCodeWire = number;

export type ChangeTrustResultCodeName =
  | "changeTrustSuccess"
  | "changeTrustMalformed"
  | "changeTrustNoIssuer"
  | "changeTrustInvalidLimit"
  | "changeTrustLowReserve"
  | "changeTrustSelfNotAllowed"
  | "changeTrustTrustLineMissing"
  | "changeTrustCannotDelete"
  | "changeTrustNotAuthMaintainLiabilities";

/**
 * ```xdr
 * enum ChangeTrustResultCode
 * {
 *     // codes considered as "success" for the operation
 *     CHANGE_TRUST_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     CHANGE_TRUST_MALFORMED = -1,     // bad input
 *     CHANGE_TRUST_NO_ISSUER = -2,     // could not find issuer
 *     CHANGE_TRUST_INVALID_LIMIT = -3, // cannot drop limit below balance
 *                                      // cannot create with a limit of 0
 *     CHANGE_TRUST_LOW_RESERVE =
 *         -4, // not enough funds to create a new trust line,
 *     CHANGE_TRUST_SELF_NOT_ALLOWED = -5,   // trusting self is not allowed
 *     CHANGE_TRUST_TRUST_LINE_MISSING = -6, // Asset trustline is missing for pool
 *     CHANGE_TRUST_CANNOT_DELETE =
 *         -7, // Asset trustline is still referenced in a pool
 *     CHANGE_TRUST_NOT_AUTH_MAINTAIN_LIABILITIES =
 *         -8 // Asset trustline is deauthorized
 * };
 * ```
 */
export class ChangeTrustResultCode extends EnumValue<ChangeTrustResultCodeName> {
  static readonly changeTrustSuccess = new ChangeTrustResultCode(
    "changeTrustSuccess",
    0,
  );
  static readonly changeTrustMalformed = new ChangeTrustResultCode(
    "changeTrustMalformed",
    -1,
  );
  static readonly changeTrustNoIssuer = new ChangeTrustResultCode(
    "changeTrustNoIssuer",
    -2,
  );
  static readonly changeTrustInvalidLimit = new ChangeTrustResultCode(
    "changeTrustInvalidLimit",
    -3,
  );
  static readonly changeTrustLowReserve = new ChangeTrustResultCode(
    "changeTrustLowReserve",
    -4,
  );
  static readonly changeTrustSelfNotAllowed = new ChangeTrustResultCode(
    "changeTrustSelfNotAllowed",
    -5,
  );
  static readonly changeTrustTrustLineMissing = new ChangeTrustResultCode(
    "changeTrustTrustLineMissing",
    -6,
  );
  static readonly changeTrustCannotDelete = new ChangeTrustResultCode(
    "changeTrustCannotDelete",
    -7,
  );
  static readonly changeTrustNotAuthMaintainLiabilities =
    new ChangeTrustResultCode("changeTrustNotAuthMaintainLiabilities", -8);

  static readonly schema = enumType("ChangeTrustResultCode", {
    changeTrustSuccess: 0,
    changeTrustMalformed: -1,
    changeTrustNoIssuer: -2,
    changeTrustInvalidLimit: -3,
    changeTrustLowReserve: -4,
    changeTrustSelfNotAllowed: -5,
    changeTrustTrustLineMissing: -6,
    changeTrustCannotDelete: -7,
    changeTrustNotAuthMaintainLiabilities: -8,
  });

  static fromValue(value: number): ChangeTrustResultCode {
    return enumFromValue(
      "ChangeTrustResultCode",
      ChangeTrustResultCode.schema,
      ChangeTrustResultCode,
      value,
    );
  }

  static fromName(name: ChangeTrustResultCodeName): ChangeTrustResultCode {
    return enumFromName("ChangeTrustResultCode", ChangeTrustResultCode, name);
  }

  static fromXdrObject(wire: number): ChangeTrustResultCode {
    return ChangeTrustResultCode.fromValue(wire);
  }
}
