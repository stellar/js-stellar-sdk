import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type AccountMergeResultCodeWire = number;

export type AccountMergeResultCodeName =
  | "accountMergeSuccess"
  | "accountMergeMalformed"
  | "accountMergeNoAccount"
  | "accountMergeImmutableSet"
  | "accountMergeHasSubEntries"
  | "accountMergeSeqnumTooFar"
  | "accountMergeDestFull"
  | "accountMergeIsSponsor";

/**
 * ```xdr
 * enum AccountMergeResultCode
 * {
 *     // codes considered as "success" for the operation
 *     ACCOUNT_MERGE_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     ACCOUNT_MERGE_MALFORMED = -1,       // can't merge onto itself
 *     ACCOUNT_MERGE_NO_ACCOUNT = -2,      // destination does not exist
 *     ACCOUNT_MERGE_IMMUTABLE_SET = -3,   // source account has AUTH_IMMUTABLE set
 *     ACCOUNT_MERGE_HAS_SUB_ENTRIES = -4, // account has trust lines/offers
 *     ACCOUNT_MERGE_SEQNUM_TOO_FAR = -5,  // sequence number is over max allowed
 *     ACCOUNT_MERGE_DEST_FULL = -6,       // can't add source balance to
 *                                         // destination balance
 *     ACCOUNT_MERGE_IS_SPONSOR = -7       // can't merge account that is a sponsor
 * };
 * ```
 */
export class AccountMergeResultCode extends EnumValue<AccountMergeResultCodeName> {
  static readonly accountMergeSuccess = new AccountMergeResultCode(
    "accountMergeSuccess",
    0,
  );
  static readonly accountMergeMalformed = new AccountMergeResultCode(
    "accountMergeMalformed",
    -1,
  );
  static readonly accountMergeNoAccount = new AccountMergeResultCode(
    "accountMergeNoAccount",
    -2,
  );
  static readonly accountMergeImmutableSet = new AccountMergeResultCode(
    "accountMergeImmutableSet",
    -3,
  );
  static readonly accountMergeHasSubEntries = new AccountMergeResultCode(
    "accountMergeHasSubEntries",
    -4,
  );
  static readonly accountMergeSeqnumTooFar = new AccountMergeResultCode(
    "accountMergeSeqnumTooFar",
    -5,
  );
  static readonly accountMergeDestFull = new AccountMergeResultCode(
    "accountMergeDestFull",
    -6,
  );
  static readonly accountMergeIsSponsor = new AccountMergeResultCode(
    "accountMergeIsSponsor",
    -7,
  );

  static readonly schema = withMemberPrefix(
    enumType("AccountMergeResultCode", {
      accountMergeSuccess: 0,
      accountMergeMalformed: -1,
      accountMergeNoAccount: -2,
      accountMergeImmutableSet: -3,
      accountMergeHasSubEntries: -4,
      accountMergeSeqnumTooFar: -5,
      accountMergeDestFull: -6,
      accountMergeIsSponsor: -7,
    }),
    "accountMerge",
  );

  static fromValue(value: number): AccountMergeResultCode {
    return enumFromValue(
      "AccountMergeResultCode",
      AccountMergeResultCode.schema,
      AccountMergeResultCode,
      value,
    );
  }

  static fromName(name: AccountMergeResultCodeName): AccountMergeResultCode {
    return enumFromName("AccountMergeResultCode", AccountMergeResultCode, name);
  }

  static fromXdrObject(wire: number): AccountMergeResultCode {
    return AccountMergeResultCode.fromValue(wire);
  }
}
