import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ClawbackClaimableBalanceResultCodeWire = number;

export type ClawbackClaimableBalanceResultCodeName =
  | "clawbackClaimableBalanceSuccess"
  | "clawbackClaimableBalanceDoesNotExist"
  | "clawbackClaimableBalanceNotIssuer"
  | "clawbackClaimableBalanceNotClawbackEnabled";

/**
 * ```xdr
 * enum ClawbackClaimableBalanceResultCode
 * {
 *     // codes considered as "success" for the operation
 *     CLAWBACK_CLAIMABLE_BALANCE_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     CLAWBACK_CLAIMABLE_BALANCE_DOES_NOT_EXIST = -1,
 *     CLAWBACK_CLAIMABLE_BALANCE_NOT_ISSUER = -2,
 *     CLAWBACK_CLAIMABLE_BALANCE_NOT_CLAWBACK_ENABLED = -3
 * };
 * ```
 */
export class ClawbackClaimableBalanceResultCode extends EnumValue<ClawbackClaimableBalanceResultCodeName> {
  static readonly clawbackClaimableBalanceSuccess =
    new ClawbackClaimableBalanceResultCode(
      "clawbackClaimableBalanceSuccess",
      0,
    );
  static readonly clawbackClaimableBalanceDoesNotExist =
    new ClawbackClaimableBalanceResultCode(
      "clawbackClaimableBalanceDoesNotExist",
      -1,
    );
  static readonly clawbackClaimableBalanceNotIssuer =
    new ClawbackClaimableBalanceResultCode(
      "clawbackClaimableBalanceNotIssuer",
      -2,
    );
  static readonly clawbackClaimableBalanceNotClawbackEnabled =
    new ClawbackClaimableBalanceResultCode(
      "clawbackClaimableBalanceNotClawbackEnabled",
      -3,
    );

  private static readonly byValue: Readonly<
    Record<number, ClawbackClaimableBalanceResultCode>
  > = {
    0: ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceSuccess,
    "-1": ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceDoesNotExist,
    "-2": ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceNotIssuer,
    "-3": ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceNotClawbackEnabled,
  };

  static readonly schema = enumType("ClawbackClaimableBalanceResultCode", {
    clawbackClaimableBalanceSuccess: 0,
    clawbackClaimableBalanceDoesNotExist: -1,
    clawbackClaimableBalanceNotIssuer: -2,
    clawbackClaimableBalanceNotClawbackEnabled: -3,
  });

  static fromValue(value: number): ClawbackClaimableBalanceResultCode {
    return enumLookup(
      "ClawbackClaimableBalanceResultCode",
      ClawbackClaimableBalanceResultCode.byValue,
      value,
    ) as ClawbackClaimableBalanceResultCode;
  }

  static fromName(
    name: ClawbackClaimableBalanceResultCodeName,
  ): ClawbackClaimableBalanceResultCode {
    switch (name) {
      case "clawbackClaimableBalanceSuccess":
        return ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceSuccess;
      case "clawbackClaimableBalanceDoesNotExist":
        return ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceDoesNotExist;
      case "clawbackClaimableBalanceNotIssuer":
        return ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceNotIssuer;
      case "clawbackClaimableBalanceNotClawbackEnabled":
        return ClawbackClaimableBalanceResultCode.clawbackClaimableBalanceNotClawbackEnabled;
      default:
        throw new XdrError(
          `ClawbackClaimableBalanceResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): ClawbackClaimableBalanceResultCode {
    return ClawbackClaimableBalanceResultCode.fromValue(wire);
  }
}
