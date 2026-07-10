import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("TrustLineFlags", {
    authorizedFlag: 1,
    authorizedToMaintainLiabilitiesFlag: 2,
    trustlineClawbackEnabledFlag: 4,
  });

  static fromValue(value: number): TrustLineFlags {
    return enumFromValue(
      "TrustLineFlags",
      TrustLineFlags.schema,
      TrustLineFlags,
      value,
    );
  }

  static fromName(name: TrustLineFlagsName): TrustLineFlags {
    return enumFromName("TrustLineFlags", TrustLineFlags, name);
  }

  static fromXdrObject(wire: number): TrustLineFlags {
    return TrustLineFlags.fromValue(wire);
  }
}
