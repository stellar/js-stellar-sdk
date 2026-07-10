/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimClaimableBalanceResultCode } from "./claim-claimable-balance-result-code.js";

export type ClaimClaimableBalanceResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 };

export type ClaimClaimableBalanceResultVariantName =
  | "claimClaimableBalanceSuccess"
  | "claimClaimableBalanceDoesNotExist"
  | "claimClaimableBalanceCannotClaim"
  | "claimClaimableBalanceLineFull"
  | "claimClaimableBalanceNoTrust"
  | "claimClaimableBalanceNotAuthorized"
  | "claimClaimableBalanceTrustlineFrozen";

/**
 * ```xdr
 * union ClaimClaimableBalanceResult switch (ClaimClaimableBalanceResultCode code)
 * {
 * case CLAIM_CLAIMABLE_BALANCE_SUCCESS:
 *     void;
 * case CLAIM_CLAIMABLE_BALANCE_DOES_NOT_EXIST:
 * case CLAIM_CLAIMABLE_BALANCE_CANNOT_CLAIM:
 * case CLAIM_CLAIMABLE_BALANCE_LINE_FULL:
 * case CLAIM_CLAIMABLE_BALANCE_NO_TRUST:
 * case CLAIM_CLAIMABLE_BALANCE_NOT_AUTHORIZED:
 * case CLAIM_CLAIMABLE_BALANCE_TRUSTLINE_FROZEN:
 *     void;
 * };
 * ```
 */
abstract class ClaimClaimableBalanceResultBase extends XdrValue {
  abstract readonly type: ClaimClaimableBalanceResultVariantName;

  static readonly schema: XdrType<ClaimClaimableBalanceResultWire> = union(
    "ClaimClaimableBalanceResult",
    {
      switchOn: ClaimClaimableBalanceResultCode.schema,
      cases: [
        case_("claimClaimableBalanceSuccess", 0, voidType()),
        case_("claimClaimableBalanceDoesNotExist", -1, voidType()),
        case_("claimClaimableBalanceCannotClaim", -2, voidType()),
        case_("claimClaimableBalanceLineFull", -3, voidType()),
        case_("claimClaimableBalanceNoTrust", -4, voidType()),
        case_("claimClaimableBalanceNotAuthorized", -5, voidType()),
        case_("claimClaimableBalanceTrustlineFrozen", -6, voidType()),
      ],
      switchKey: "code",
    },
  );

  static claimClaimableBalanceSuccess(): ClaimClaimableBalanceResultSuccess {
    return new ClaimClaimableBalanceResultSuccess();
  }

  static claimClaimableBalanceDoesNotExist(): ClaimClaimableBalanceResultDoesNotExist {
    return new ClaimClaimableBalanceResultDoesNotExist();
  }

  static claimClaimableBalanceCannotClaim(): ClaimClaimableBalanceResultCannotClaim {
    return new ClaimClaimableBalanceResultCannotClaim();
  }

  static claimClaimableBalanceLineFull(): ClaimClaimableBalanceResultLineFull {
    return new ClaimClaimableBalanceResultLineFull();
  }

  static claimClaimableBalanceNoTrust(): ClaimClaimableBalanceResultNoTrust {
    return new ClaimClaimableBalanceResultNoTrust();
  }

  static claimClaimableBalanceNotAuthorized(): ClaimClaimableBalanceResultNotAuthorized {
    return new ClaimClaimableBalanceResultNotAuthorized();
  }

  static claimClaimableBalanceTrustlineFrozen(): ClaimClaimableBalanceResultTrustlineFrozen {
    return new ClaimClaimableBalanceResultTrustlineFrozen();
  }

  static fromXdrObject(
    wire: ClaimClaimableBalanceResultWire,
  ): ClaimClaimableBalanceResult {
    switch (wire.code) {
      case 0:
        return new ClaimClaimableBalanceResultSuccess();
      case -1:
        return new ClaimClaimableBalanceResultDoesNotExist();
      case -2:
        return new ClaimClaimableBalanceResultCannotClaim();
      case -3:
        return new ClaimClaimableBalanceResultLineFull();
      case -4:
        return new ClaimClaimableBalanceResultNoTrust();
      case -5:
        return new ClaimClaimableBalanceResultNotAuthorized();
      case -6:
        return new ClaimClaimableBalanceResultTrustlineFrozen();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ClaimClaimableBalanceResult variant.
   * Use this instead of `instanceof ClaimClaimableBalanceResult`: the exported `ClaimClaimableBalanceResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ClaimClaimableBalanceResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ClaimClaimableBalanceResult {
    return value instanceof ClaimClaimableBalanceResultBase;
  }

  abstract toXdrObject(): ClaimClaimableBalanceResultWire;
}

export class ClaimClaimableBalanceResultSuccess extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ClaimClaimableBalanceResultDoesNotExist extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceDoesNotExist" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ClaimClaimableBalanceResultCannotClaim extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceCannotClaim" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ClaimClaimableBalanceResultLineFull extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ClaimClaimableBalanceResultNoTrust extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class ClaimClaimableBalanceResultNotAuthorized extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class ClaimClaimableBalanceResultTrustlineFrozen extends ClaimClaimableBalanceResultBase {
  readonly type = "claimClaimableBalanceTrustlineFrozen" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClaimClaimableBalanceResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export type ClaimClaimableBalanceResult =
  | ClaimClaimableBalanceResultSuccess
  | ClaimClaimableBalanceResultDoesNotExist
  | ClaimClaimableBalanceResultCannotClaim
  | ClaimClaimableBalanceResultLineFull
  | ClaimClaimableBalanceResultNoTrust
  | ClaimClaimableBalanceResultNotAuthorized
  | ClaimClaimableBalanceResultTrustlineFrozen;
export const ClaimClaimableBalanceResult = ClaimClaimableBalanceResultBase;
