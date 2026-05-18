/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { AllowTrustResultCode } from "./allow-trust-result-code.js";

export type AllowTrustResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 };

export type AllowTrustResultVariantName =
  | "allowTrustSuccess"
  | "allowTrustMalformed"
  | "allowTrustNoTrustLine"
  | "allowTrustTrustNotRequired"
  | "allowTrustCantRevoke"
  | "allowTrustSelfNotAllowed"
  | "allowTrustLowReserve";

/**
 * ```xdr
 * union AllowTrustResult switch (AllowTrustResultCode code)
 * {
 * case ALLOW_TRUST_SUCCESS:
 *     void;
 * case ALLOW_TRUST_MALFORMED:
 * case ALLOW_TRUST_NO_TRUST_LINE:
 * case ALLOW_TRUST_TRUST_NOT_REQUIRED:
 * case ALLOW_TRUST_CANT_REVOKE:
 * case ALLOW_TRUST_SELF_NOT_ALLOWED:
 * case ALLOW_TRUST_LOW_RESERVE:
 *     void;
 * };
 * ```
 */
abstract class AllowTrustResultBase extends XdrValue {
  abstract readonly type: AllowTrustResultVariantName;

  static readonly schema: XdrType<AllowTrustResultWire> = union(
    "AllowTrustResult",
    {
      switchOn: AllowTrustResultCode.schema,
      cases: [
        case_("allowTrustSuccess", 0, voidType()),
        case_("allowTrustMalformed", -1, voidType()),
        case_("allowTrustNoTrustLine", -2, voidType()),
        case_("allowTrustTrustNotRequired", -3, voidType()),
        case_("allowTrustCantRevoke", -4, voidType()),
        case_("allowTrustSelfNotAllowed", -5, voidType()),
        case_("allowTrustLowReserve", -6, voidType()),
      ],
      switchKey: "code",
    },
  );

  static allowTrustSuccess(): AllowTrustResultSuccess {
    return new AllowTrustResultSuccess();
  }

  static allowTrustMalformed(): AllowTrustResultMalformed {
    return new AllowTrustResultMalformed();
  }

  static allowTrustNoTrustLine(): AllowTrustResultNoTrustLine {
    return new AllowTrustResultNoTrustLine();
  }

  static allowTrustTrustNotRequired(): AllowTrustResultTrustNotRequired {
    return new AllowTrustResultTrustNotRequired();
  }

  static allowTrustCantRevoke(): AllowTrustResultCantRevoke {
    return new AllowTrustResultCantRevoke();
  }

  static allowTrustSelfNotAllowed(): AllowTrustResultSelfNotAllowed {
    return new AllowTrustResultSelfNotAllowed();
  }

  static allowTrustLowReserve(): AllowTrustResultLowReserve {
    return new AllowTrustResultLowReserve();
  }

  static fromXdrObject(wire: AllowTrustResultWire): AllowTrustResult {
    switch (wire.code) {
      case 0:
        return new AllowTrustResultSuccess();
      case -1:
        return new AllowTrustResultMalformed();
      case -2:
        return new AllowTrustResultNoTrustLine();
      case -3:
        return new AllowTrustResultTrustNotRequired();
      case -4:
        return new AllowTrustResultCantRevoke();
      case -5:
        return new AllowTrustResultSelfNotAllowed();
      case -6:
        return new AllowTrustResultLowReserve();
    }
  }

  abstract toXdrObject(): AllowTrustResultWire;
}

export class AllowTrustResultSuccess extends AllowTrustResultBase {
  readonly type = "allowTrustSuccess" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class AllowTrustResultMalformed extends AllowTrustResultBase {
  readonly type = "allowTrustMalformed" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class AllowTrustResultNoTrustLine extends AllowTrustResultBase {
  readonly type = "allowTrustNoTrustLine" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class AllowTrustResultTrustNotRequired extends AllowTrustResultBase {
  readonly type = "allowTrustTrustNotRequired" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class AllowTrustResultCantRevoke extends AllowTrustResultBase {
  readonly type = "allowTrustCantRevoke" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class AllowTrustResultSelfNotAllowed extends AllowTrustResultBase {
  readonly type = "allowTrustSelfNotAllowed" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class AllowTrustResultLowReserve extends AllowTrustResultBase {
  readonly type = "allowTrustLowReserve" as const;

  toXdrObject(): Extract<AllowTrustResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export type AllowTrustResult =
  | AllowTrustResultSuccess
  | AllowTrustResultMalformed
  | AllowTrustResultNoTrustLine
  | AllowTrustResultTrustNotRequired
  | AllowTrustResultCantRevoke
  | AllowTrustResultSelfNotAllowed
  | AllowTrustResultLowReserve;
export const AllowTrustResult = AllowTrustResultBase;
