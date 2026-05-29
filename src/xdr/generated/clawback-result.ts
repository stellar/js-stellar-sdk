/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClawbackResultCode } from "./clawback-result-code.js";

export type ClawbackResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 };

export type ClawbackResultVariantName =
  | "clawbackSuccess"
  | "clawbackMalformed"
  | "clawbackNotClawbackEnabled"
  | "clawbackNoTrust"
  | "clawbackUnderfunded";

/**
 * ```xdr
 * union ClawbackResult switch (ClawbackResultCode code)
 * {
 * case CLAWBACK_SUCCESS:
 *     void;
 * case CLAWBACK_MALFORMED:
 * case CLAWBACK_NOT_CLAWBACK_ENABLED:
 * case CLAWBACK_NO_TRUST:
 * case CLAWBACK_UNDERFUNDED:
 *     void;
 * };
 * ```
 */
abstract class ClawbackResultBase extends XdrValue {
  abstract readonly type: ClawbackResultVariantName;

  static readonly schema: XdrType<ClawbackResultWire> = union(
    "ClawbackResult",
    {
      switchOn: ClawbackResultCode.schema,
      cases: [
        case_("clawbackSuccess", 0, voidType()),
        case_("clawbackMalformed", -1, voidType()),
        case_("clawbackNotClawbackEnabled", -2, voidType()),
        case_("clawbackNoTrust", -3, voidType()),
        case_("clawbackUnderfunded", -4, voidType()),
      ],
      switchKey: "code",
    },
  );

  static clawbackSuccess(): ClawbackResultSuccess {
    return new ClawbackResultSuccess();
  }

  static clawbackMalformed(): ClawbackResultMalformed {
    return new ClawbackResultMalformed();
  }

  static clawbackNotClawbackEnabled(): ClawbackResultNotClawbackEnabled {
    return new ClawbackResultNotClawbackEnabled();
  }

  static clawbackNoTrust(): ClawbackResultNoTrust {
    return new ClawbackResultNoTrust();
  }

  static clawbackUnderfunded(): ClawbackResultUnderfunded {
    return new ClawbackResultUnderfunded();
  }

  static fromXdrObject(wire: ClawbackResultWire): ClawbackResult {
    switch (wire.code) {
      case 0:
        return new ClawbackResultSuccess();
      case -1:
        return new ClawbackResultMalformed();
      case -2:
        return new ClawbackResultNotClawbackEnabled();
      case -3:
        return new ClawbackResultNoTrust();
      case -4:
        return new ClawbackResultUnderfunded();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ClawbackResult variant.
   * Use this instead of `instanceof ClawbackResult`: the exported `ClawbackResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ClawbackResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ClawbackResult {
    return value instanceof ClawbackResultBase;
  }

  abstract toXdrObject(): ClawbackResultWire;
}

export class ClawbackResultSuccess extends ClawbackResultBase {
  readonly type = "clawbackSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ClawbackResultMalformed extends ClawbackResultBase {
  readonly type = "clawbackMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ClawbackResultNotClawbackEnabled extends ClawbackResultBase {
  readonly type = "clawbackNotClawbackEnabled" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ClawbackResultNoTrust extends ClawbackResultBase {
  readonly type = "clawbackNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ClawbackResultUnderfunded extends ClawbackResultBase {
  readonly type = "clawbackUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ClawbackResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export type ClawbackResult =
  | ClawbackResultSuccess
  | ClawbackResultMalformed
  | ClawbackResultNotClawbackEnabled
  | ClawbackResultNoTrust
  | ClawbackResultUnderfunded;
export const ClawbackResult = ClawbackResultBase;
