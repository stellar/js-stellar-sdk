import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type AllowTrustResultCodeWire = number;

export type AllowTrustResultCodeName =
  | "allowTrustSuccess"
  | "allowTrustMalformed"
  | "allowTrustNoTrustLine"
  | "allowTrustTrustNotRequired"
  | "allowTrustCantRevoke"
  | "allowTrustSelfNotAllowed"
  | "allowTrustLowReserve";

/**
 * ```xdr
 * enum AllowTrustResultCode
 * {
 *     // codes considered as "success" for the operation
 *     ALLOW_TRUST_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     ALLOW_TRUST_MALFORMED = -1,     // asset is not ASSET_TYPE_ALPHANUM
 *     ALLOW_TRUST_NO_TRUST_LINE = -2, // trustor does not have a trustline
 *                                     // source account does not require trust
 *     ALLOW_TRUST_TRUST_NOT_REQUIRED = -3,
 *     ALLOW_TRUST_CANT_REVOKE = -4,      // source account can't revoke trust,
 *     ALLOW_TRUST_SELF_NOT_ALLOWED = -5, // trusting self is not allowed
 *     ALLOW_TRUST_LOW_RESERVE = -6       // claimable balances can't be created
 *                                        // on revoke due to low reserves
 * };
 * ```
 */
export class AllowTrustResultCode extends EnumValue<AllowTrustResultCodeName> {
  static readonly allowTrustSuccess = new AllowTrustResultCode(
    "allowTrustSuccess",
    0,
  );
  static readonly allowTrustMalformed = new AllowTrustResultCode(
    "allowTrustMalformed",
    -1,
  );
  static readonly allowTrustNoTrustLine = new AllowTrustResultCode(
    "allowTrustNoTrustLine",
    -2,
  );
  static readonly allowTrustTrustNotRequired = new AllowTrustResultCode(
    "allowTrustTrustNotRequired",
    -3,
  );
  static readonly allowTrustCantRevoke = new AllowTrustResultCode(
    "allowTrustCantRevoke",
    -4,
  );
  static readonly allowTrustSelfNotAllowed = new AllowTrustResultCode(
    "allowTrustSelfNotAllowed",
    -5,
  );
  static readonly allowTrustLowReserve = new AllowTrustResultCode(
    "allowTrustLowReserve",
    -6,
  );

  static readonly schema = withMemberPrefix(
    enumType("AllowTrustResultCode", {
      allowTrustSuccess: 0,
      allowTrustMalformed: -1,
      allowTrustNoTrustLine: -2,
      allowTrustTrustNotRequired: -3,
      allowTrustCantRevoke: -4,
      allowTrustSelfNotAllowed: -5,
      allowTrustLowReserve: -6,
    }),
    "allowTrust",
  );

  static fromValue(value: number): AllowTrustResultCode {
    return enumFromValue(
      "AllowTrustResultCode",
      AllowTrustResultCode.schema,
      AllowTrustResultCode,
      value,
    );
  }

  static fromName(name: AllowTrustResultCodeName): AllowTrustResultCode {
    return enumFromName("AllowTrustResultCode", AllowTrustResultCode, name);
  }

  static fromXdrObject(wire: number): AllowTrustResultCode {
    return AllowTrustResultCode.fromValue(wire);
  }
}
