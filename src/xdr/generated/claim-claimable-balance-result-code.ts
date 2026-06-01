import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ClaimClaimableBalanceResultCodeWire = number;

export type ClaimClaimableBalanceResultCodeName =
  | "claimClaimableBalanceSuccess"
  | "claimClaimableBalanceDoesNotExist"
  | "claimClaimableBalanceCannotClaim"
  | "claimClaimableBalanceLineFull"
  | "claimClaimableBalanceNoTrust"
  | "claimClaimableBalanceNotAuthorized"
  | "claimClaimableBalanceTrustlineFrozen";

/**
 * ```xdr
 * enum ClaimClaimableBalanceResultCode
 * {
 *     CLAIM_CLAIMABLE_BALANCE_SUCCESS = 0,
 *     CLAIM_CLAIMABLE_BALANCE_DOES_NOT_EXIST = -1,
 *     CLAIM_CLAIMABLE_BALANCE_CANNOT_CLAIM = -2,
 *     CLAIM_CLAIMABLE_BALANCE_LINE_FULL = -3,
 *     CLAIM_CLAIMABLE_BALANCE_NO_TRUST = -4,
 *     CLAIM_CLAIMABLE_BALANCE_NOT_AUTHORIZED = -5,
 *     CLAIM_CLAIMABLE_BALANCE_TRUSTLINE_FROZEN = -6
 * };
 * ```
 */
export class ClaimClaimableBalanceResultCode extends EnumValue<ClaimClaimableBalanceResultCodeName> {
  static readonly claimClaimableBalanceSuccess =
    new ClaimClaimableBalanceResultCode("claimClaimableBalanceSuccess", 0);
  static readonly claimClaimableBalanceDoesNotExist =
    new ClaimClaimableBalanceResultCode(
      "claimClaimableBalanceDoesNotExist",
      -1,
    );
  static readonly claimClaimableBalanceCannotClaim =
    new ClaimClaimableBalanceResultCode("claimClaimableBalanceCannotClaim", -2);
  static readonly claimClaimableBalanceLineFull =
    new ClaimClaimableBalanceResultCode("claimClaimableBalanceLineFull", -3);
  static readonly claimClaimableBalanceNoTrust =
    new ClaimClaimableBalanceResultCode("claimClaimableBalanceNoTrust", -4);
  static readonly claimClaimableBalanceNotAuthorized =
    new ClaimClaimableBalanceResultCode(
      "claimClaimableBalanceNotAuthorized",
      -5,
    );
  static readonly claimClaimableBalanceTrustlineFrozen =
    new ClaimClaimableBalanceResultCode(
      "claimClaimableBalanceTrustlineFrozen",
      -6,
    );

  static readonly schema = withMemberPrefix(
    enumType("ClaimClaimableBalanceResultCode", {
      claimClaimableBalanceSuccess: 0,
      claimClaimableBalanceDoesNotExist: -1,
      claimClaimableBalanceCannotClaim: -2,
      claimClaimableBalanceLineFull: -3,
      claimClaimableBalanceNoTrust: -4,
      claimClaimableBalanceNotAuthorized: -5,
      claimClaimableBalanceTrustlineFrozen: -6,
    }),
    "claimClaimableBalance",
  );

  static fromValue(value: number): ClaimClaimableBalanceResultCode {
    return enumFromValue(
      "ClaimClaimableBalanceResultCode",
      ClaimClaimableBalanceResultCode.schema,
      ClaimClaimableBalanceResultCode,
      value,
    );
  }

  static fromName(
    name: ClaimClaimableBalanceResultCodeName,
  ): ClaimClaimableBalanceResultCode {
    return enumFromName(
      "ClaimClaimableBalanceResultCode",
      ClaimClaimableBalanceResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): ClaimClaimableBalanceResultCode {
    return ClaimClaimableBalanceResultCode.fromValue(wire);
  }
}
