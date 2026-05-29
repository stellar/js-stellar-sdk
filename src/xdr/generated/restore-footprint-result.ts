/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { RestoreFootprintResultCode } from "./restore-footprint-result-code.js";

export type RestoreFootprintResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 };

export type RestoreFootprintResultVariantName =
  | "restoreFootprintSuccess"
  | "restoreFootprintMalformed"
  | "restoreFootprintResourceLimitExceeded"
  | "restoreFootprintInsufficientRefundableFee";

/**
 * ```xdr
 * union RestoreFootprintResult switch (RestoreFootprintResultCode code)
 * {
 * case RESTORE_FOOTPRINT_SUCCESS:
 *     void;
 * case RESTORE_FOOTPRINT_MALFORMED:
 * case RESTORE_FOOTPRINT_RESOURCE_LIMIT_EXCEEDED:
 * case RESTORE_FOOTPRINT_INSUFFICIENT_REFUNDABLE_FEE:
 *     void;
 * };
 * ```
 */
abstract class RestoreFootprintResultBase extends XdrValue {
  abstract readonly type: RestoreFootprintResultVariantName;

  static readonly schema: XdrType<RestoreFootprintResultWire> = union(
    "RestoreFootprintResult",
    {
      switchOn: RestoreFootprintResultCode.schema,
      cases: [
        case_("restoreFootprintSuccess", 0, voidType()),
        case_("restoreFootprintMalformed", -1, voidType()),
        case_("restoreFootprintResourceLimitExceeded", -2, voidType()),
        case_("restoreFootprintInsufficientRefundableFee", -3, voidType()),
      ],
      switchKey: "code",
    },
  );

  static restoreFootprintSuccess(): RestoreFootprintResultSuccess {
    return new RestoreFootprintResultSuccess();
  }

  static restoreFootprintMalformed(): RestoreFootprintResultMalformed {
    return new RestoreFootprintResultMalformed();
  }

  static restoreFootprintResourceLimitExceeded(): RestoreFootprintResultResourceLimitExceeded {
    return new RestoreFootprintResultResourceLimitExceeded();
  }

  static restoreFootprintInsufficientRefundableFee(): RestoreFootprintResultInsufficientRefundableFee {
    return new RestoreFootprintResultInsufficientRefundableFee();
  }

  static fromXdrObject(
    wire: RestoreFootprintResultWire,
  ): RestoreFootprintResult {
    switch (wire.code) {
      case 0:
        return new RestoreFootprintResultSuccess();
      case -1:
        return new RestoreFootprintResultMalformed();
      case -2:
        return new RestoreFootprintResultResourceLimitExceeded();
      case -3:
        return new RestoreFootprintResultInsufficientRefundableFee();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete RestoreFootprintResult variant.
   * Use this instead of `instanceof RestoreFootprintResult`: the exported `RestoreFootprintResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `RestoreFootprintResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is RestoreFootprintResult {
    return value instanceof RestoreFootprintResultBase;
  }

  abstract toXdrObject(): RestoreFootprintResultWire;
}

export class RestoreFootprintResultSuccess extends RestoreFootprintResultBase {
  readonly type = "restoreFootprintSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<RestoreFootprintResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class RestoreFootprintResultMalformed extends RestoreFootprintResultBase {
  readonly type = "restoreFootprintMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<RestoreFootprintResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class RestoreFootprintResultResourceLimitExceeded extends RestoreFootprintResultBase {
  readonly type = "restoreFootprintResourceLimitExceeded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<RestoreFootprintResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class RestoreFootprintResultInsufficientRefundableFee extends RestoreFootprintResultBase {
  readonly type = "restoreFootprintInsufficientRefundableFee" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<RestoreFootprintResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export type RestoreFootprintResult =
  | RestoreFootprintResultSuccess
  | RestoreFootprintResultMalformed
  | RestoreFootprintResultResourceLimitExceeded
  | RestoreFootprintResultInsufficientRefundableFee;
export const RestoreFootprintResult = RestoreFootprintResultBase;
