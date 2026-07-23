/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { SetOptionsResultCode } from "./set-options-result-code.js";

export type SetOptionsResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 }
  | { code: -9 }
  | { code: -10 };

export type SetOptionsResultVariantName =
  | "setOptionsSuccess"
  | "setOptionsLowReserve"
  | "setOptionsTooManySigners"
  | "setOptionsBadFlags"
  | "setOptionsInvalidInflation"
  | "setOptionsCantChange"
  | "setOptionsUnknownFlag"
  | "setOptionsThresholdOutOfRange"
  | "setOptionsBadSigner"
  | "setOptionsInvalidHomeDomain"
  | "setOptionsAuthRevocableRequired";

/**
 * ```xdr
 * union SetOptionsResult switch (SetOptionsResultCode code)
 * {
 * case SET_OPTIONS_SUCCESS:
 *     void;
 * case SET_OPTIONS_LOW_RESERVE:
 * case SET_OPTIONS_TOO_MANY_SIGNERS:
 * case SET_OPTIONS_BAD_FLAGS:
 * case SET_OPTIONS_INVALID_INFLATION:
 * case SET_OPTIONS_CANT_CHANGE:
 * case SET_OPTIONS_UNKNOWN_FLAG:
 * case SET_OPTIONS_THRESHOLD_OUT_OF_RANGE:
 * case SET_OPTIONS_BAD_SIGNER:
 * case SET_OPTIONS_INVALID_HOME_DOMAIN:
 * case SET_OPTIONS_AUTH_REVOCABLE_REQUIRED:
 *     void;
 * };
 * ```
 */
abstract class SetOptionsResultBase extends XdrValue {
  abstract readonly type: SetOptionsResultVariantName;

  static readonly schema: XdrType<SetOptionsResultWire> = union(
    "SetOptionsResult",
    {
      switchOn: SetOptionsResultCode.schema,
      cases: [
        case_("setOptionsSuccess", 0, voidType()),
        case_("setOptionsLowReserve", -1, voidType()),
        case_("setOptionsTooManySigners", -2, voidType()),
        case_("setOptionsBadFlags", -3, voidType()),
        case_("setOptionsInvalidInflation", -4, voidType()),
        case_("setOptionsCantChange", -5, voidType()),
        case_("setOptionsUnknownFlag", -6, voidType()),
        case_("setOptionsThresholdOutOfRange", -7, voidType()),
        case_("setOptionsBadSigner", -8, voidType()),
        case_("setOptionsInvalidHomeDomain", -9, voidType()),
        case_("setOptionsAuthRevocableRequired", -10, voidType()),
      ],
      switchKey: "code",
    },
  );

  static setOptionsSuccess(): SetOptionsResultSuccess {
    return new SetOptionsResultSuccess();
  }

  static setOptionsLowReserve(): SetOptionsResultLowReserve {
    return new SetOptionsResultLowReserve();
  }

  static setOptionsTooManySigners(): SetOptionsResultTooManySigners {
    return new SetOptionsResultTooManySigners();
  }

  static setOptionsBadFlags(): SetOptionsResultBadFlags {
    return new SetOptionsResultBadFlags();
  }

  static setOptionsInvalidInflation(): SetOptionsResultInvalidInflation {
    return new SetOptionsResultInvalidInflation();
  }

  static setOptionsCantChange(): SetOptionsResultCantChange {
    return new SetOptionsResultCantChange();
  }

  static setOptionsUnknownFlag(): SetOptionsResultUnknownFlag {
    return new SetOptionsResultUnknownFlag();
  }

  static setOptionsThresholdOutOfRange(): SetOptionsResultThresholdOutOfRange {
    return new SetOptionsResultThresholdOutOfRange();
  }

  static setOptionsBadSigner(): SetOptionsResultBadSigner {
    return new SetOptionsResultBadSigner();
  }

  static setOptionsInvalidHomeDomain(): SetOptionsResultInvalidHomeDomain {
    return new SetOptionsResultInvalidHomeDomain();
  }

  static setOptionsAuthRevocableRequired(): SetOptionsResultAuthRevocableRequired {
    return new SetOptionsResultAuthRevocableRequired();
  }

  static fromXdrObject(wire: SetOptionsResultWire): SetOptionsResult {
    switch (wire.code) {
      case 0:
        return new SetOptionsResultSuccess();
      case -1:
        return new SetOptionsResultLowReserve();
      case -2:
        return new SetOptionsResultTooManySigners();
      case -3:
        return new SetOptionsResultBadFlags();
      case -4:
        return new SetOptionsResultInvalidInflation();
      case -5:
        return new SetOptionsResultCantChange();
      case -6:
        return new SetOptionsResultUnknownFlag();
      case -7:
        return new SetOptionsResultThresholdOutOfRange();
      case -8:
        return new SetOptionsResultBadSigner();
      case -9:
        return new SetOptionsResultInvalidHomeDomain();
      case -10:
        return new SetOptionsResultAuthRevocableRequired();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SetOptionsResult variant.
   * Use this instead of `instanceof SetOptionsResult`: the exported `SetOptionsResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SetOptionsResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SetOptionsResult {
    return value instanceof SetOptionsResultBase;
  }

  abstract toXdrObject(): SetOptionsResultWire;
}

export class SetOptionsResultSuccess extends SetOptionsResultBase {
  readonly type = "setOptionsSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class SetOptionsResultLowReserve extends SetOptionsResultBase {
  readonly type = "setOptionsLowReserve" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class SetOptionsResultTooManySigners extends SetOptionsResultBase {
  readonly type = "setOptionsTooManySigners" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class SetOptionsResultBadFlags extends SetOptionsResultBase {
  readonly type = "setOptionsBadFlags" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class SetOptionsResultInvalidInflation extends SetOptionsResultBase {
  readonly type = "setOptionsInvalidInflation" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class SetOptionsResultCantChange extends SetOptionsResultBase {
  readonly type = "setOptionsCantChange" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class SetOptionsResultUnknownFlag extends SetOptionsResultBase {
  readonly type = "setOptionsUnknownFlag" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class SetOptionsResultThresholdOutOfRange extends SetOptionsResultBase {
  readonly type = "setOptionsThresholdOutOfRange" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class SetOptionsResultBadSigner extends SetOptionsResultBase {
  readonly type = "setOptionsBadSigner" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class SetOptionsResultInvalidHomeDomain extends SetOptionsResultBase {
  readonly type = "setOptionsInvalidHomeDomain" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export class SetOptionsResultAuthRevocableRequired extends SetOptionsResultBase {
  readonly type = "setOptionsAuthRevocableRequired" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SetOptionsResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export type SetOptionsResult =
  | SetOptionsResultSuccess
  | SetOptionsResultLowReserve
  | SetOptionsResultTooManySigners
  | SetOptionsResultBadFlags
  | SetOptionsResultInvalidInflation
  | SetOptionsResultCantChange
  | SetOptionsResultUnknownFlag
  | SetOptionsResultThresholdOutOfRange
  | SetOptionsResultBadSigner
  | SetOptionsResultInvalidHomeDomain
  | SetOptionsResultAuthRevocableRequired;
export const SetOptionsResult = SetOptionsResultBase;
