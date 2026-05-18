import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type AccountFlagsWire = number;

export type AccountFlagsName =
  | "authRequiredFlag"
  | "authRevocableFlag"
  | "authImmutableFlag"
  | "authClawbackEnabledFlag";

/**
 * ```xdr
 * enum AccountFlags
 * { // masks for each flag
 *
 *     // Flags set on issuer accounts
 *     // TrustLines are created with authorized set to "false" requiring
 *     // the issuer to set it for each TrustLine
 *     AUTH_REQUIRED_FLAG = 0x1,
 *     // If set, the authorized flag in TrustLines can be cleared
 *     // otherwise, authorization cannot be revoked
 *     AUTH_REVOCABLE_FLAG = 0x2,
 *     // Once set, causes all AUTH_* flags to be read-only
 *     AUTH_IMMUTABLE_FLAG = 0x4,
 *     // Trustlines are created with clawback enabled set to "true",
 *     // and claimable balances created from those trustlines are created
 *     // with clawback enabled set to "true"
 *     AUTH_CLAWBACK_ENABLED_FLAG = 0x8
 * };
 * ```
 */
export class AccountFlags extends EnumValue<AccountFlagsName> {
  static readonly authRequiredFlag = new AccountFlags("authRequiredFlag", 1);
  static readonly authRevocableFlag = new AccountFlags("authRevocableFlag", 2);
  static readonly authImmutableFlag = new AccountFlags("authImmutableFlag", 4);
  static readonly authClawbackEnabledFlag = new AccountFlags(
    "authClawbackEnabledFlag",
    8,
  );

  private static readonly byValue: Readonly<Record<number, AccountFlags>> = {
    1: AccountFlags.authRequiredFlag,
    2: AccountFlags.authRevocableFlag,
    4: AccountFlags.authImmutableFlag,
    8: AccountFlags.authClawbackEnabledFlag,
  };

  static readonly schema = enumType("AccountFlags", {
    authRequiredFlag: 1,
    authRevocableFlag: 2,
    authImmutableFlag: 4,
    authClawbackEnabledFlag: 8,
  });

  static fromValue(value: number): AccountFlags {
    return enumLookup(
      "AccountFlags",
      AccountFlags.byValue,
      value,
    ) as AccountFlags;
  }

  static fromName(name: AccountFlagsName): AccountFlags {
    switch (name) {
      case "authRequiredFlag":
        return AccountFlags.authRequiredFlag;
      case "authRevocableFlag":
        return AccountFlags.authRevocableFlag;
      case "authImmutableFlag":
        return AccountFlags.authImmutableFlag;
      case "authClawbackEnabledFlag":
        return AccountFlags.authClawbackEnabledFlag;
      default:
        throw new XdrError(`AccountFlags: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): AccountFlags {
    return AccountFlags.fromValue(wire);
  }
}
