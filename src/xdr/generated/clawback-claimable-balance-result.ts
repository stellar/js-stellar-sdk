/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClawbackClaimableBalanceResultCode } from "./clawback-claimable-balance-result-code.js";

export type ClawbackClaimableBalanceResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 };

export type ClawbackClaimableBalanceResultVariantName =
  | "clawbackClaimableBalanceSuccess"
  | "clawbackClaimableBalanceDoesNotExist"
  | "clawbackClaimableBalanceNotIssuer"
  | "clawbackClaimableBalanceNotClawbackEnabled";

/**
 * ```xdr
 * union ClawbackClaimableBalanceResult switch (
 *     ClawbackClaimableBalanceResultCode code)
 * {
 * case CLAWBACK_CLAIMABLE_BALANCE_SUCCESS:
 *     void;
 * case CLAWBACK_CLAIMABLE_BALANCE_DOES_NOT_EXIST:
 * case CLAWBACK_CLAIMABLE_BALANCE_NOT_ISSUER:
 * case CLAWBACK_CLAIMABLE_BALANCE_NOT_CLAWBACK_ENABLED:
 *     void;
 * };
 * ```
 */
abstract class ClawbackClaimableBalanceResultBase extends XdrValue {
  abstract readonly type: ClawbackClaimableBalanceResultVariantName;

  static readonly schema: XdrType<ClawbackClaimableBalanceResultWire> = union(
    "ClawbackClaimableBalanceResult",
    {
      switchOn: ClawbackClaimableBalanceResultCode.schema,
      cases: [
        case_("clawbackClaimableBalanceSuccess", 0, voidType()),
        case_("clawbackClaimableBalanceDoesNotExist", -1, voidType()),
        case_("clawbackClaimableBalanceNotIssuer", -2, voidType()),
        case_("clawbackClaimableBalanceNotClawbackEnabled", -3, voidType()),
      ],
      switchKey: "code",
    },
  );

  static clawbackClaimableBalanceSuccess(): ClawbackClaimableBalanceResultSuccess {
    return new ClawbackClaimableBalanceResultSuccess();
  }

  static clawbackClaimableBalanceDoesNotExist(): ClawbackClaimableBalanceResultDoesNotExist {
    return new ClawbackClaimableBalanceResultDoesNotExist();
  }

  static clawbackClaimableBalanceNotIssuer(): ClawbackClaimableBalanceResultNotIssuer {
    return new ClawbackClaimableBalanceResultNotIssuer();
  }

  static clawbackClaimableBalanceNotClawbackEnabled(): ClawbackClaimableBalanceResultNotClawbackEnabled {
    return new ClawbackClaimableBalanceResultNotClawbackEnabled();
  }

  static fromXdrObject(
    wire: ClawbackClaimableBalanceResultWire,
  ): ClawbackClaimableBalanceResult {
    switch (wire.code) {
      case 0:
        return new ClawbackClaimableBalanceResultSuccess();
      case -1:
        return new ClawbackClaimableBalanceResultDoesNotExist();
      case -2:
        return new ClawbackClaimableBalanceResultNotIssuer();
      case -3:
        return new ClawbackClaimableBalanceResultNotClawbackEnabled();
    }
  }

  abstract toXdrObject(): ClawbackClaimableBalanceResultWire;
}

export class ClawbackClaimableBalanceResultSuccess extends ClawbackClaimableBalanceResultBase {
  readonly type = "clawbackClaimableBalanceSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackClaimableBalanceResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ClawbackClaimableBalanceResultDoesNotExist extends ClawbackClaimableBalanceResultBase {
  readonly type = "clawbackClaimableBalanceDoesNotExist" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackClaimableBalanceResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ClawbackClaimableBalanceResultNotIssuer extends ClawbackClaimableBalanceResultBase {
  readonly type = "clawbackClaimableBalanceNotIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackClaimableBalanceResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ClawbackClaimableBalanceResultNotClawbackEnabled extends ClawbackClaimableBalanceResultBase {
  readonly type = "clawbackClaimableBalanceNotClawbackEnabled" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackClaimableBalanceResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export type ClawbackClaimableBalanceResult =
  | ClawbackClaimableBalanceResultSuccess
  | ClawbackClaimableBalanceResultDoesNotExist
  | ClawbackClaimableBalanceResultNotIssuer
  | ClawbackClaimableBalanceResultNotClawbackEnabled;
export const ClawbackClaimableBalanceResult =
  ClawbackClaimableBalanceResultBase;
