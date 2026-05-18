import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type TrustLineFlagsWire = number;

export type TrustLineFlagsName =
  | "authorizedFlag"
  | "authorizedToMaintainLiabilitiesFlag"
  | "trustlineClawbackEnabledFlag";

/**
 * ```xdr
 * enum TrustLineFlags
 * {
 *     // issuer has authorized account to perform transactions with its credit
 *     AUTHORIZED_FLAG = 1,
 *     // issuer has authorized account to maintain and reduce liabilities for its
 *     // credit
 *     AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG = 2,
 *     // issuer has specified that it may clawback its credit, and that claimable
 *     // balances created with its credit may also be clawed back
 *     TRUSTLINE_CLAWBACK_ENABLED_FLAG = 4
 * };
 * ```
 */
export class TrustLineFlags extends EnumValue<TrustLineFlagsName> {
  static readonly authorizedFlag = new TrustLineFlags("authorizedFlag", 1);
  static readonly authorizedToMaintainLiabilitiesFlag = new TrustLineFlags(
    "authorizedToMaintainLiabilitiesFlag",
    2,
  );
  static readonly trustlineClawbackEnabledFlag = new TrustLineFlags(
    "trustlineClawbackEnabledFlag",
    4,
  );

  private static readonly byValue: Readonly<Record<number, TrustLineFlags>> = {
    1: TrustLineFlags.authorizedFlag,
    2: TrustLineFlags.authorizedToMaintainLiabilitiesFlag,
    4: TrustLineFlags.trustlineClawbackEnabledFlag,
  };

  static readonly schema = enumType("TrustLineFlags", {
    authorizedFlag: 1,
    authorizedToMaintainLiabilitiesFlag: 2,
    trustlineClawbackEnabledFlag: 4,
  });

  static fromValue(value: number): TrustLineFlags {
    return enumLookup(
      "TrustLineFlags",
      TrustLineFlags.byValue,
      value,
    ) as TrustLineFlags;
  }

  static fromName(name: TrustLineFlagsName): TrustLineFlags {
    switch (name) {
      case "authorizedFlag":
        return TrustLineFlags.authorizedFlag;
      case "authorizedToMaintainLiabilitiesFlag":
        return TrustLineFlags.authorizedToMaintainLiabilitiesFlag;
      case "trustlineClawbackEnabledFlag":
        return TrustLineFlags.trustlineClawbackEnabledFlag;
      default:
        throw new XdrError(`TrustLineFlags: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): TrustLineFlags {
    return TrustLineFlags.fromValue(wire);
  }
}
