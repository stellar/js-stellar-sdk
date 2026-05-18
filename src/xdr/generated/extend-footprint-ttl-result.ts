/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtendFootprintTtlResultCode } from "./extend-footprint-ttl-result-code.js";

export type ExtendFootprintTtlResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 };

export type ExtendFootprintTtlResultVariantName =
  | "extendFootprintTtlSuccess"
  | "extendFootprintTtlMalformed"
  | "extendFootprintTtlResourceLimitExceeded"
  | "extendFootprintTtlInsufficientRefundableFee";

/**
 * ```xdr
 * union ExtendFootprintTTLResult switch (ExtendFootprintTTLResultCode code)
 * {
 * case EXTEND_FOOTPRINT_TTL_SUCCESS:
 *     void;
 * case EXTEND_FOOTPRINT_TTL_MALFORMED:
 * case EXTEND_FOOTPRINT_TTL_RESOURCE_LIMIT_EXCEEDED:
 * case EXTEND_FOOTPRINT_TTL_INSUFFICIENT_REFUNDABLE_FEE:
 *     void;
 * };
 * ```
 */
abstract class ExtendFootprintTtlResultBase extends XdrValue {
  abstract readonly type: ExtendFootprintTtlResultVariantName;

  static readonly schema: XdrType<ExtendFootprintTtlResultWire> = union(
    "ExtendFootprintTtlResult",
    {
      switchOn: ExtendFootprintTtlResultCode.schema,
      cases: [
        case_("extendFootprintTtlSuccess", 0, voidType()),
        case_("extendFootprintTtlMalformed", -1, voidType()),
        case_("extendFootprintTtlResourceLimitExceeded", -2, voidType()),
        case_("extendFootprintTtlInsufficientRefundableFee", -3, voidType()),
      ],
      switchKey: "code",
    },
  );

  static extendFootprintTtlSuccess(): ExtendFootprintTtlResultSuccess {
    return new ExtendFootprintTtlResultSuccess();
  }

  static extendFootprintTtlMalformed(): ExtendFootprintTtlResultMalformed {
    return new ExtendFootprintTtlResultMalformed();
  }

  static extendFootprintTtlResourceLimitExceeded(): ExtendFootprintTtlResultResourceLimitExceeded {
    return new ExtendFootprintTtlResultResourceLimitExceeded();
  }

  static extendFootprintTtlInsufficientRefundableFee(): ExtendFootprintTtlResultInsufficientRefundableFee {
    return new ExtendFootprintTtlResultInsufficientRefundableFee();
  }

  static fromXdrObject(
    wire: ExtendFootprintTtlResultWire,
  ): ExtendFootprintTtlResult {
    switch (wire.code) {
      case 0:
        return new ExtendFootprintTtlResultSuccess();
      case -1:
        return new ExtendFootprintTtlResultMalformed();
      case -2:
        return new ExtendFootprintTtlResultResourceLimitExceeded();
      case -3:
        return new ExtendFootprintTtlResultInsufficientRefundableFee();
    }
  }

  abstract toXdrObject(): ExtendFootprintTtlResultWire;
}

export class ExtendFootprintTtlResultSuccess extends ExtendFootprintTtlResultBase {
  readonly type = "extendFootprintTtlSuccess" as const;

  toXdrObject(): Extract<ExtendFootprintTtlResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ExtendFootprintTtlResultMalformed extends ExtendFootprintTtlResultBase {
  readonly type = "extendFootprintTtlMalformed" as const;

  toXdrObject(): Extract<ExtendFootprintTtlResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ExtendFootprintTtlResultResourceLimitExceeded extends ExtendFootprintTtlResultBase {
  readonly type = "extendFootprintTtlResourceLimitExceeded" as const;

  toXdrObject(): Extract<ExtendFootprintTtlResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ExtendFootprintTtlResultInsufficientRefundableFee extends ExtendFootprintTtlResultBase {
  readonly type = "extendFootprintTtlInsufficientRefundableFee" as const;

  toXdrObject(): Extract<ExtendFootprintTtlResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export type ExtendFootprintTtlResult =
  | ExtendFootprintTtlResultSuccess
  | ExtendFootprintTtlResultMalformed
  | ExtendFootprintTtlResultResourceLimitExceeded
  | ExtendFootprintTtlResultInsufficientRefundableFee;
export const ExtendFootprintTtlResult = ExtendFootprintTtlResultBase;
