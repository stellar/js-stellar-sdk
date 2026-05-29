/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { AccountMergeResultCode } from "./account-merge-result-code.js";

export type AccountMergeResultWire =
  | { code: 0; sourceAccountBalance: bigint }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 };

export type AccountMergeResultVariantName =
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
 * union AccountMergeResult switch (AccountMergeResultCode code)
 * {
 * case ACCOUNT_MERGE_SUCCESS:
 *     int64 sourceAccountBalance; // how much got transferred from source account
 * case ACCOUNT_MERGE_MALFORMED:
 * case ACCOUNT_MERGE_NO_ACCOUNT:
 * case ACCOUNT_MERGE_IMMUTABLE_SET:
 * case ACCOUNT_MERGE_HAS_SUB_ENTRIES:
 * case ACCOUNT_MERGE_SEQNUM_TOO_FAR:
 * case ACCOUNT_MERGE_DEST_FULL:
 * case ACCOUNT_MERGE_IS_SPONSOR:
 *     void;
 * };
 * ```
 */
abstract class AccountMergeResultBase extends XdrValue {
  abstract readonly type: AccountMergeResultVariantName;

  static readonly schema: XdrType<AccountMergeResultWire> = union(
    "AccountMergeResult",
    {
      switchOn: AccountMergeResultCode.schema,
      cases: [
        case_("accountMergeSuccess", 0, field("sourceAccountBalance", int64())),
        case_("accountMergeMalformed", -1, voidType()),
        case_("accountMergeNoAccount", -2, voidType()),
        case_("accountMergeImmutableSet", -3, voidType()),
        case_("accountMergeHasSubEntries", -4, voidType()),
        case_("accountMergeSeqnumTooFar", -5, voidType()),
        case_("accountMergeDestFull", -6, voidType()),
        case_("accountMergeIsSponsor", -7, voidType()),
      ],
      switchKey: "code",
    },
  );

  static accountMergeSuccess(
    sourceAccountBalance: bigint,
  ): AccountMergeResultSuccess {
    return new AccountMergeResultSuccess(sourceAccountBalance);
  }

  static accountMergeMalformed(): AccountMergeResultMalformed {
    return new AccountMergeResultMalformed();
  }

  static accountMergeNoAccount(): AccountMergeResultNoAccount {
    return new AccountMergeResultNoAccount();
  }

  static accountMergeImmutableSet(): AccountMergeResultImmutableSet {
    return new AccountMergeResultImmutableSet();
  }

  static accountMergeHasSubEntries(): AccountMergeResultHasSubEntries {
    return new AccountMergeResultHasSubEntries();
  }

  static accountMergeSeqnumTooFar(): AccountMergeResultSeqnumTooFar {
    return new AccountMergeResultSeqnumTooFar();
  }

  static accountMergeDestFull(): AccountMergeResultDestFull {
    return new AccountMergeResultDestFull();
  }

  static accountMergeIsSponsor(): AccountMergeResultIsSponsor {
    return new AccountMergeResultIsSponsor();
  }

  static fromXdrObject(wire: AccountMergeResultWire): AccountMergeResult {
    switch (wire.code) {
      case 0:
        return new AccountMergeResultSuccess(wire.sourceAccountBalance);
      case -1:
        return new AccountMergeResultMalformed();
      case -2:
        return new AccountMergeResultNoAccount();
      case -3:
        return new AccountMergeResultImmutableSet();
      case -4:
        return new AccountMergeResultHasSubEntries();
      case -5:
        return new AccountMergeResultSeqnumTooFar();
      case -6:
        return new AccountMergeResultDestFull();
      case -7:
        return new AccountMergeResultIsSponsor();
    }
  }

  abstract toXdrObject(): AccountMergeResultWire;
}

export class AccountMergeResultSuccess extends AccountMergeResultBase {
  readonly type = "accountMergeSuccess" as const;
  readonly sourceAccountBalance: bigint;

  constructor(sourceAccountBalance: bigint) {
    super();
    this.sourceAccountBalance = sourceAccountBalance;
  }

  get value(): bigint {
    return this.sourceAccountBalance;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: 0 }> {
    return { code: 0, sourceAccountBalance: this.sourceAccountBalance };
  }
}

export class AccountMergeResultMalformed extends AccountMergeResultBase {
  readonly type = "accountMergeMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class AccountMergeResultNoAccount extends AccountMergeResultBase {
  readonly type = "accountMergeNoAccount" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class AccountMergeResultImmutableSet extends AccountMergeResultBase {
  readonly type = "accountMergeImmutableSet" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class AccountMergeResultHasSubEntries extends AccountMergeResultBase {
  readonly type = "accountMergeHasSubEntries" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class AccountMergeResultSeqnumTooFar extends AccountMergeResultBase {
  readonly type = "accountMergeSeqnumTooFar" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class AccountMergeResultDestFull extends AccountMergeResultBase {
  readonly type = "accountMergeDestFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class AccountMergeResultIsSponsor extends AccountMergeResultBase {
  readonly type = "accountMergeIsSponsor" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AccountMergeResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export type AccountMergeResult =
  | AccountMergeResultSuccess
  | AccountMergeResultMalformed
  | AccountMergeResultNoAccount
  | AccountMergeResultImmutableSet
  | AccountMergeResultHasSubEntries
  | AccountMergeResultSeqnumTooFar
  | AccountMergeResultDestFull
  | AccountMergeResultIsSponsor;
export const AccountMergeResult = AccountMergeResultBase;
