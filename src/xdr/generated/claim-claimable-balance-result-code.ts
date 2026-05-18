import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ClaimClaimableBalanceResultCode>
  > = {
    0: ClaimClaimableBalanceResultCode.claimClaimableBalanceSuccess,
    "-1": ClaimClaimableBalanceResultCode.claimClaimableBalanceDoesNotExist,
    "-2": ClaimClaimableBalanceResultCode.claimClaimableBalanceCannotClaim,
    "-3": ClaimClaimableBalanceResultCode.claimClaimableBalanceLineFull,
    "-4": ClaimClaimableBalanceResultCode.claimClaimableBalanceNoTrust,
    "-5": ClaimClaimableBalanceResultCode.claimClaimableBalanceNotAuthorized,
    "-6": ClaimClaimableBalanceResultCode.claimClaimableBalanceTrustlineFrozen,
  };

  static readonly schema = enumType("ClaimClaimableBalanceResultCode", {
    claimClaimableBalanceSuccess: 0,
    claimClaimableBalanceDoesNotExist: -1,
    claimClaimableBalanceCannotClaim: -2,
    claimClaimableBalanceLineFull: -3,
    claimClaimableBalanceNoTrust: -4,
    claimClaimableBalanceNotAuthorized: -5,
    claimClaimableBalanceTrustlineFrozen: -6,
  });

  static fromValue(value: number): ClaimClaimableBalanceResultCode {
    return enumLookup(
      "ClaimClaimableBalanceResultCode",
      ClaimClaimableBalanceResultCode.byValue,
      value,
    ) as ClaimClaimableBalanceResultCode;
  }

  static fromName(
    name: ClaimClaimableBalanceResultCodeName,
  ): ClaimClaimableBalanceResultCode {
    switch (name) {
      case "claimClaimableBalanceSuccess":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceSuccess;
      case "claimClaimableBalanceDoesNotExist":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceDoesNotExist;
      case "claimClaimableBalanceCannotClaim":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceCannotClaim;
      case "claimClaimableBalanceLineFull":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceLineFull;
      case "claimClaimableBalanceNoTrust":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceNoTrust;
      case "claimClaimableBalanceNotAuthorized":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceNotAuthorized;
      case "claimClaimableBalanceTrustlineFrozen":
        return ClaimClaimableBalanceResultCode.claimClaimableBalanceTrustlineFrozen;
      default:
        throw new XdrError(
          `ClaimClaimableBalanceResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): ClaimClaimableBalanceResultCode {
    return ClaimClaimableBalanceResultCode.fromValue(wire);
  }
}
