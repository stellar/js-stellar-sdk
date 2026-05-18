import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ClaimableBalanceFlags>
  > = {
    1: ClaimableBalanceFlags.claimableBalanceClawbackEnabledFlag,
  };

  static readonly schema = enumType("ClaimableBalanceFlags", {
    claimableBalanceClawbackEnabledFlag: 1,
  });

  static fromValue(value: number): ClaimableBalanceFlags {
    return enumLookup(
      "ClaimableBalanceFlags",
      ClaimableBalanceFlags.byValue,
      value,
    ) as ClaimableBalanceFlags;
  }

  static fromName(name: ClaimableBalanceFlagsName): ClaimableBalanceFlags {
    switch (name) {
      case "claimableBalanceClawbackEnabledFlag":
        return ClaimableBalanceFlags.claimableBalanceClawbackEnabledFlag;
      default:
        throw new XdrError(`ClaimableBalanceFlags: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClaimableBalanceFlags {
    return ClaimableBalanceFlags.fromValue(wire);
  }
}
