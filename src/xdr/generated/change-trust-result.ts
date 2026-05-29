/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ChangeTrustResultCode } from "./change-trust-result-code.js";

export type ChangeTrustResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 };

export type ChangeTrustResultVariantName =
  | "changeTrustSuccess"
  | "changeTrustMalformed"
  | "changeTrustNoIssuer"
  | "changeTrustInvalidLimit"
  | "changeTrustLowReserve"
  | "changeTrustSelfNotAllowed"
  | "changeTrustTrustLineMissing"
  | "changeTrustCannotDelete"
  | "changeTrustNotAuthMaintainLiabilities";

/**
 * ```xdr
 * union ChangeTrustResult switch (ChangeTrustResultCode code)
 * {
 * case CHANGE_TRUST_SUCCESS:
 *     void;
 * case CHANGE_TRUST_MALFORMED:
 * case CHANGE_TRUST_NO_ISSUER:
 * case CHANGE_TRUST_INVALID_LIMIT:
 * case CHANGE_TRUST_LOW_RESERVE:
 * case CHANGE_TRUST_SELF_NOT_ALLOWED:
 * case CHANGE_TRUST_TRUST_LINE_MISSING:
 * case CHANGE_TRUST_CANNOT_DELETE:
 * case CHANGE_TRUST_NOT_AUTH_MAINTAIN_LIABILITIES:
 *     void;
 * };
 * ```
 */
abstract class ChangeTrustResultBase extends XdrValue {
  abstract readonly type: ChangeTrustResultVariantName;

  static readonly schema: XdrType<ChangeTrustResultWire> = union(
    "ChangeTrustResult",
    {
      switchOn: ChangeTrustResultCode.schema,
      cases: [
        case_("changeTrustSuccess", 0, voidType()),
        case_("changeTrustMalformed", -1, voidType()),
        case_("changeTrustNoIssuer", -2, voidType()),
        case_("changeTrustInvalidLimit", -3, voidType()),
        case_("changeTrustLowReserve", -4, voidType()),
        case_("changeTrustSelfNotAllowed", -5, voidType()),
        case_("changeTrustTrustLineMissing", -6, voidType()),
        case_("changeTrustCannotDelete", -7, voidType()),
        case_("changeTrustNotAuthMaintainLiabilities", -8, voidType()),
      ],
      switchKey: "code",
    },
  );

  static changeTrustSuccess(): ChangeTrustResultSuccess {
    return new ChangeTrustResultSuccess();
  }

  static changeTrustMalformed(): ChangeTrustResultMalformed {
    return new ChangeTrustResultMalformed();
  }

  static changeTrustNoIssuer(): ChangeTrustResultNoIssuer {
    return new ChangeTrustResultNoIssuer();
  }

  static changeTrustInvalidLimit(): ChangeTrustResultInvalidLimit {
    return new ChangeTrustResultInvalidLimit();
  }

  static changeTrustLowReserve(): ChangeTrustResultLowReserve {
    return new ChangeTrustResultLowReserve();
  }

  static changeTrustSelfNotAllowed(): ChangeTrustResultSelfNotAllowed {
    return new ChangeTrustResultSelfNotAllowed();
  }

  static changeTrustTrustLineMissing(): ChangeTrustResultTrustLineMissing {
    return new ChangeTrustResultTrustLineMissing();
  }

  static changeTrustCannotDelete(): ChangeTrustResultCannotDelete {
    return new ChangeTrustResultCannotDelete();
  }

  static changeTrustNotAuthMaintainLiabilities(): ChangeTrustResultNotAuthMaintainLiabilities {
    return new ChangeTrustResultNotAuthMaintainLiabilities();
  }

  static fromXdrObject(wire: ChangeTrustResultWire): ChangeTrustResult {
    switch (wire.code) {
      case 0:
        return new ChangeTrustResultSuccess();
      case -1:
        return new ChangeTrustResultMalformed();
      case -2:
        return new ChangeTrustResultNoIssuer();
      case -3:
        return new ChangeTrustResultInvalidLimit();
      case -4:
        return new ChangeTrustResultLowReserve();
      case -5:
        return new ChangeTrustResultSelfNotAllowed();
      case -6:
        return new ChangeTrustResultTrustLineMissing();
      case -7:
        return new ChangeTrustResultCannotDelete();
      case -8:
        return new ChangeTrustResultNotAuthMaintainLiabilities();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ChangeTrustResult variant.
   * Use this instead of `instanceof ChangeTrustResult`: the exported `ChangeTrustResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ChangeTrustResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ChangeTrustResult {
    return value instanceof ChangeTrustResultBase;
  }

  abstract toXdrObject(): ChangeTrustResultWire;
}

export class ChangeTrustResultSuccess extends ChangeTrustResultBase {
  readonly type = "changeTrustSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ChangeTrustResultMalformed extends ChangeTrustResultBase {
  readonly type = "changeTrustMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ChangeTrustResultNoIssuer extends ChangeTrustResultBase {
  readonly type = "changeTrustNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ChangeTrustResultInvalidLimit extends ChangeTrustResultBase {
  readonly type = "changeTrustInvalidLimit" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ChangeTrustResultLowReserve extends ChangeTrustResultBase {
  readonly type = "changeTrustLowReserve" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class ChangeTrustResultSelfNotAllowed extends ChangeTrustResultBase {
  readonly type = "changeTrustSelfNotAllowed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class ChangeTrustResultTrustLineMissing extends ChangeTrustResultBase {
  readonly type = "changeTrustTrustLineMissing" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class ChangeTrustResultCannotDelete extends ChangeTrustResultBase {
  readonly type = "changeTrustCannotDelete" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class ChangeTrustResultNotAuthMaintainLiabilities extends ChangeTrustResultBase {
  readonly type = "changeTrustNotAuthMaintainLiabilities" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export type ChangeTrustResult =
  | ChangeTrustResultSuccess
  | ChangeTrustResultMalformed
  | ChangeTrustResultNoIssuer
  | ChangeTrustResultInvalidLimit
  | ChangeTrustResultLowReserve
  | ChangeTrustResultSelfNotAllowed
  | ChangeTrustResultTrustLineMissing
  | ChangeTrustResultCannotDelete
  | ChangeTrustResultNotAuthMaintainLiabilities;
export const ChangeTrustResult = ChangeTrustResultBase;
