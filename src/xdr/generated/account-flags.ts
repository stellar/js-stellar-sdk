import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("AccountFlags", {
      authRequiredFlag: 1,
      authRevocableFlag: 2,
      authImmutableFlag: 4,
      authClawbackEnabledFlag: 8,
    }),
    "auth",
  );

  static fromValue(value: number): AccountFlags {
    return enumFromValue(
      "AccountFlags",
      AccountFlags.schema,
      AccountFlags,
      value,
    );
  }

  static fromName(name: AccountFlagsName): AccountFlags {
    return enumFromName("AccountFlags", AccountFlags, name);
  }

  static fromXdrObject(wire: number): AccountFlags {
    return AccountFlags.fromValue(wire);
  }
}
