/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SetTrustLineFlagsResultCode } from "./set-trust-line-flags-result-code.js";

export type SetTrustLineFlagsResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 };

export type SetTrustLineFlagsResultVariantName =
  | "setTrustLineFlagsSuccess"
  | "setTrustLineFlagsMalformed"
  | "setTrustLineFlagsNoTrustLine"
  | "setTrustLineFlagsCantRevoke"
  | "setTrustLineFlagsInvalidState"
  | "setTrustLineFlagsLowReserve";

/**
 * ```xdr
 * union SetTrustLineFlagsResult switch (SetTrustLineFlagsResultCode code)
 * {
 * case SET_TRUST_LINE_FLAGS_SUCCESS:
 *     void;
 * case SET_TRUST_LINE_FLAGS_MALFORMED:
 * case SET_TRUST_LINE_FLAGS_NO_TRUST_LINE:
 * case SET_TRUST_LINE_FLAGS_CANT_REVOKE:
 * case SET_TRUST_LINE_FLAGS_INVALID_STATE:
 * case SET_TRUST_LINE_FLAGS_LOW_RESERVE:
 *     void;
 * };
 * ```
 */
abstract class SetTrustLineFlagsResultBase extends XdrValue {
  abstract readonly type: SetTrustLineFlagsResultVariantName;

  static readonly schema: XdrType<SetTrustLineFlagsResultWire> = union(
    "SetTrustLineFlagsResult",
    {
      switchOn: SetTrustLineFlagsResultCode.schema,
      cases: [
        case_("setTrustLineFlagsSuccess", 0, voidType()),
        case_("setTrustLineFlagsMalformed", -1, voidType()),
        case_("setTrustLineFlagsNoTrustLine", -2, voidType()),
        case_("setTrustLineFlagsCantRevoke", -3, voidType()),
        case_("setTrustLineFlagsInvalidState", -4, voidType()),
        case_("setTrustLineFlagsLowReserve", -5, voidType()),
      ],
      switchKey: "code",
    },
  );

  static setTrustLineFlagsSuccess(): SetTrustLineFlagsResultSuccess {
    return new SetTrustLineFlagsResultSuccess();
  }

  static setTrustLineFlagsMalformed(): SetTrustLineFlagsResultMalformed {
    return new SetTrustLineFlagsResultMalformed();
  }

  static setTrustLineFlagsNoTrustLine(): SetTrustLineFlagsResultNoTrustLine {
    return new SetTrustLineFlagsResultNoTrustLine();
  }

  static setTrustLineFlagsCantRevoke(): SetTrustLineFlagsResultCantRevoke {
    return new SetTrustLineFlagsResultCantRevoke();
  }

  static setTrustLineFlagsInvalidState(): SetTrustLineFlagsResultInvalidState {
    return new SetTrustLineFlagsResultInvalidState();
  }

  static setTrustLineFlagsLowReserve(): SetTrustLineFlagsResultLowReserve {
    return new SetTrustLineFlagsResultLowReserve();
  }

  static fromXdrObject(
    wire: SetTrustLineFlagsResultWire,
  ): SetTrustLineFlagsResult {
    switch (wire.code) {
      case 0:
        return new SetTrustLineFlagsResultSuccess();
      case -1:
        return new SetTrustLineFlagsResultMalformed();
      case -2:
        return new SetTrustLineFlagsResultNoTrustLine();
      case -3:
        return new SetTrustLineFlagsResultCantRevoke();
      case -4:
        return new SetTrustLineFlagsResultInvalidState();
      case -5:
        return new SetTrustLineFlagsResultLowReserve();
    }
  }

  abstract toXdrObject(): SetTrustLineFlagsResultWire;
}

export class SetTrustLineFlagsResultSuccess extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsSuccess" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class SetTrustLineFlagsResultMalformed extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsMalformed" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class SetTrustLineFlagsResultNoTrustLine extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsNoTrustLine" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class SetTrustLineFlagsResultCantRevoke extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsCantRevoke" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class SetTrustLineFlagsResultInvalidState extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsInvalidState" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class SetTrustLineFlagsResultLowReserve extends SetTrustLineFlagsResultBase {
  readonly type = "setTrustLineFlagsLowReserve" as const;

  toXdrObject(): Extract<SetTrustLineFlagsResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export type SetTrustLineFlagsResult =
  | SetTrustLineFlagsResultSuccess
  | SetTrustLineFlagsResultMalformed
  | SetTrustLineFlagsResultNoTrustLine
  | SetTrustLineFlagsResultCantRevoke
  | SetTrustLineFlagsResultInvalidState
  | SetTrustLineFlagsResultLowReserve;
export const SetTrustLineFlagsResult = SetTrustLineFlagsResultBase;
