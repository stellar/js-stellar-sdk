import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ClaimableBalanceFlagsWire = number;

export type ClaimableBalanceFlagsName = "claimableBalanceClawbackEnabledFlag";

/**
 * ```xdr
 * enum ClaimableBalanceFlags
 * {
 *     // If set, the issuer account of the asset held by the claimable balance may
 *     // clawback the claimable balance
 *     CLAIMABLE_BALANCE_CLAWBACK_ENABLED_FLAG = 0x1
 * };
 * ```
 */
export class ClaimableBalanceFlags extends EnumValue<ClaimableBalanceFlagsName> {
  static readonly claimableBalanceClawbackEnabledFlag =
    new ClaimableBalanceFlags("claimableBalanceClawbackEnabledFlag", 1);

  static readonly schema = enumType("ClaimableBalanceFlags", {
    claimableBalanceClawbackEnabledFlag: 1,
  });

  static fromValue(value: number): ClaimableBalanceFlags {
    return enumFromValue(
      "ClaimableBalanceFlags",
      ClaimableBalanceFlags.schema,
      ClaimableBalanceFlags,
      value,
    );
  }

  static fromName(name: ClaimableBalanceFlagsName): ClaimableBalanceFlags {
    return enumFromName("ClaimableBalanceFlags", ClaimableBalanceFlags, name);
  }

  static fromXdrObject(wire: number): ClaimableBalanceFlags {
    return ClaimableBalanceFlags.fromValue(wire);
  }
}
