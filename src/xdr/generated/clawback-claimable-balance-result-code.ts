import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ClawbackClaimableBalanceResultCode", {
      clawbackClaimableBalanceSuccess: 0,
      clawbackClaimableBalanceDoesNotExist: -1,
      clawbackClaimableBalanceNotIssuer: -2,
      clawbackClaimableBalanceNotClawbackEnabled: -3,
    }),
    "clawbackClaimableBalance",
  );

  static fromValue(value: number): ClawbackClaimableBalanceResultCode {
    return enumFromValue(
      "ClawbackClaimableBalanceResultCode",
      ClawbackClaimableBalanceResultCode.schema,
      ClawbackClaimableBalanceResultCode,
      value,
    );
  }

  static fromName(
    name: ClawbackClaimableBalanceResultCodeName,
  ): ClawbackClaimableBalanceResultCode {
    return enumFromName(
      "ClawbackClaimableBalanceResultCode",
      ClawbackClaimableBalanceResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): ClawbackClaimableBalanceResultCode {
    return ClawbackClaimableBalanceResultCode.fromValue(wire);
  }
}
