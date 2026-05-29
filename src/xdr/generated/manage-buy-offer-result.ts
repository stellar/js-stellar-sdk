/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ManageBuyOfferResultCode } from "./manage-buy-offer-result-code.js";
import {
  ManageOfferSuccessResult,
  type ManageOfferSuccessResultWire,
} from "./manage-offer-success-result.js";

export type ManageBuyOfferResultWire =
  | { code: 0; success: ManageOfferSuccessResultWire }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 }
  | { code: -9 }
  | { code: -10 }
  | { code: -11 }
  | { code: -12 };

export type ManageBuyOfferResultVariantName =
  | "manageBuyOfferSuccess"
  | "manageBuyOfferMalformed"
  | "manageBuyOfferSellNoTrust"
  | "manageBuyOfferBuyNoTrust"
  | "manageBuyOfferSellNotAuthorized"
  | "manageBuyOfferBuyNotAuthorized"
  | "manageBuyOfferLineFull"
  | "manageBuyOfferUnderfunded"
  | "manageBuyOfferCrossSelf"
  | "manageBuyOfferSellNoIssuer"
  | "manageBuyOfferBuyNoIssuer"
  | "manageBuyOfferNotFound"
  | "manageBuyOfferLowReserve";

/**
 * ```xdr
 * union ManageBuyOfferResult switch (ManageBuyOfferResultCode code)
 * {
 * case MANAGE_BUY_OFFER_SUCCESS:
 *     ManageOfferSuccessResult success;
 * case MANAGE_BUY_OFFER_MALFORMED:
 * case MANAGE_BUY_OFFER_SELL_NO_TRUST:
 * case MANAGE_BUY_OFFER_BUY_NO_TRUST:
 * case MANAGE_BUY_OFFER_SELL_NOT_AUTHORIZED:
 * case MANAGE_BUY_OFFER_BUY_NOT_AUTHORIZED:
 * case MANAGE_BUY_OFFER_LINE_FULL:
 * case MANAGE_BUY_OFFER_UNDERFUNDED:
 * case MANAGE_BUY_OFFER_CROSS_SELF:
 * case MANAGE_BUY_OFFER_SELL_NO_ISSUER:
 * case MANAGE_BUY_OFFER_BUY_NO_ISSUER:
 * case MANAGE_BUY_OFFER_NOT_FOUND:
 * case MANAGE_BUY_OFFER_LOW_RESERVE:
 *     void;
 * };
 * ```
 */
abstract class ManageBuyOfferResultBase extends XdrValue {
  abstract readonly type: ManageBuyOfferResultVariantName;

  static readonly schema: XdrType<ManageBuyOfferResultWire> = union(
    "ManageBuyOfferResult",
    {
      switchOn: ManageBuyOfferResultCode.schema,
      cases: [
        case_(
          "manageBuyOfferSuccess",
          0,
          field("success", ManageOfferSuccessResult.schema),
        ),
        case_("manageBuyOfferMalformed", -1, voidType()),
        case_("manageBuyOfferSellNoTrust", -2, voidType()),
        case_("manageBuyOfferBuyNoTrust", -3, voidType()),
        case_("manageBuyOfferSellNotAuthorized", -4, voidType()),
        case_("manageBuyOfferBuyNotAuthorized", -5, voidType()),
        case_("manageBuyOfferLineFull", -6, voidType()),
        case_("manageBuyOfferUnderfunded", -7, voidType()),
        case_("manageBuyOfferCrossSelf", -8, voidType()),
        case_("manageBuyOfferSellNoIssuer", -9, voidType()),
        case_("manageBuyOfferBuyNoIssuer", -10, voidType()),
        case_("manageBuyOfferNotFound", -11, voidType()),
        case_("manageBuyOfferLowReserve", -12, voidType()),
      ],
      switchKey: "code",
    },
  );

  static manageBuyOfferSuccess(
    success: ManageOfferSuccessResult,
  ): ManageBuyOfferResultSuccess {
    return new ManageBuyOfferResultSuccess(success);
  }

  static manageBuyOfferMalformed(): ManageBuyOfferResultMalformed {
    return new ManageBuyOfferResultMalformed();
  }

  static manageBuyOfferSellNoTrust(): ManageBuyOfferResultSellNoTrust {
    return new ManageBuyOfferResultSellNoTrust();
  }

  static manageBuyOfferBuyNoTrust(): ManageBuyOfferResultBuyNoTrust {
    return new ManageBuyOfferResultBuyNoTrust();
  }

  static manageBuyOfferSellNotAuthorized(): ManageBuyOfferResultSellNotAuthorized {
    return new ManageBuyOfferResultSellNotAuthorized();
  }

  static manageBuyOfferBuyNotAuthorized(): ManageBuyOfferResultBuyNotAuthorized {
    return new ManageBuyOfferResultBuyNotAuthorized();
  }

  static manageBuyOfferLineFull(): ManageBuyOfferResultLineFull {
    return new ManageBuyOfferResultLineFull();
  }

  static manageBuyOfferUnderfunded(): ManageBuyOfferResultUnderfunded {
    return new ManageBuyOfferResultUnderfunded();
  }

  static manageBuyOfferCrossSelf(): ManageBuyOfferResultCrossSelf {
    return new ManageBuyOfferResultCrossSelf();
  }

  static manageBuyOfferSellNoIssuer(): ManageBuyOfferResultSellNoIssuer {
    return new ManageBuyOfferResultSellNoIssuer();
  }

  static manageBuyOfferBuyNoIssuer(): ManageBuyOfferResultBuyNoIssuer {
    return new ManageBuyOfferResultBuyNoIssuer();
  }

  static manageBuyOfferNotFound(): ManageBuyOfferResultNotFound {
    return new ManageBuyOfferResultNotFound();
  }

  static manageBuyOfferLowReserve(): ManageBuyOfferResultLowReserve {
    return new ManageBuyOfferResultLowReserve();
  }

  static fromXdrObject(wire: ManageBuyOfferResultWire): ManageBuyOfferResult {
    switch (wire.code) {
      case 0:
        return new ManageBuyOfferResultSuccess(
          ManageOfferSuccessResult.fromXdrObject(wire.success),
        );
      case -1:
        return new ManageBuyOfferResultMalformed();
      case -2:
        return new ManageBuyOfferResultSellNoTrust();
      case -3:
        return new ManageBuyOfferResultBuyNoTrust();
      case -4:
        return new ManageBuyOfferResultSellNotAuthorized();
      case -5:
        return new ManageBuyOfferResultBuyNotAuthorized();
      case -6:
        return new ManageBuyOfferResultLineFull();
      case -7:
        return new ManageBuyOfferResultUnderfunded();
      case -8:
        return new ManageBuyOfferResultCrossSelf();
      case -9:
        return new ManageBuyOfferResultSellNoIssuer();
      case -10:
        return new ManageBuyOfferResultBuyNoIssuer();
      case -11:
        return new ManageBuyOfferResultNotFound();
      case -12:
        return new ManageBuyOfferResultLowReserve();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ManageBuyOfferResult variant.
   * Use this instead of `instanceof ManageBuyOfferResult`: the exported `ManageBuyOfferResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ManageBuyOfferResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ManageBuyOfferResult {
    return value instanceof ManageBuyOfferResultBase;
  }

  abstract toXdrObject(): ManageBuyOfferResultWire;
}

export class ManageBuyOfferResultSuccess extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferSuccess" as const;
  readonly success: ManageOfferSuccessResult;

  constructor(success: ManageOfferSuccessResult) {
    super();
    this.success = success;
  }

  get value(): ManageOfferSuccessResult {
    return this.success;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: 0 }> {
    return { code: 0, success: this.success.toXdrObject() };
  }
}

export class ManageBuyOfferResultMalformed extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ManageBuyOfferResultSellNoTrust extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferSellNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ManageBuyOfferResultBuyNoTrust extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferBuyNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ManageBuyOfferResultSellNotAuthorized extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferSellNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class ManageBuyOfferResultBuyNotAuthorized extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferBuyNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class ManageBuyOfferResultLineFull extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class ManageBuyOfferResultUnderfunded extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class ManageBuyOfferResultCrossSelf extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferCrossSelf" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class ManageBuyOfferResultSellNoIssuer extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferSellNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export class ManageBuyOfferResultBuyNoIssuer extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferBuyNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class ManageBuyOfferResultNotFound extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferNotFound" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class ManageBuyOfferResultLowReserve extends ManageBuyOfferResultBase {
  readonly type = "manageBuyOfferLowReserve" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageBuyOfferResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export type ManageBuyOfferResult =
  | ManageBuyOfferResultSuccess
  | ManageBuyOfferResultMalformed
  | ManageBuyOfferResultSellNoTrust
  | ManageBuyOfferResultBuyNoTrust
  | ManageBuyOfferResultSellNotAuthorized
  | ManageBuyOfferResultBuyNotAuthorized
  | ManageBuyOfferResultLineFull
  | ManageBuyOfferResultUnderfunded
  | ManageBuyOfferResultCrossSelf
  | ManageBuyOfferResultSellNoIssuer
  | ManageBuyOfferResultBuyNoIssuer
  | ManageBuyOfferResultNotFound
  | ManageBuyOfferResultLowReserve;
export const ManageBuyOfferResult = ManageBuyOfferResultBase;
