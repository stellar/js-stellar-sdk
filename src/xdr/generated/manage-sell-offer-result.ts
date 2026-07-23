/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ManageSellOfferResultCode } from "./manage-sell-offer-result-code.js";
import {
  ManageOfferSuccessResult,
  type ManageOfferSuccessResultWire,
} from "./manage-offer-success-result.js";

export type ManageSellOfferResultWire =
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

export type ManageSellOfferResultVariantName =
  | "manageSellOfferSuccess"
  | "manageSellOfferMalformed"
  | "manageSellOfferSellNoTrust"
  | "manageSellOfferBuyNoTrust"
  | "manageSellOfferSellNotAuthorized"
  | "manageSellOfferBuyNotAuthorized"
  | "manageSellOfferLineFull"
  | "manageSellOfferUnderfunded"
  | "manageSellOfferCrossSelf"
  | "manageSellOfferSellNoIssuer"
  | "manageSellOfferBuyNoIssuer"
  | "manageSellOfferNotFound"
  | "manageSellOfferLowReserve";

/**
 * ```xdr
 * union ManageSellOfferResult switch (ManageSellOfferResultCode code)
 * {
 * case MANAGE_SELL_OFFER_SUCCESS:
 *     ManageOfferSuccessResult success;
 * case MANAGE_SELL_OFFER_MALFORMED:
 * case MANAGE_SELL_OFFER_SELL_NO_TRUST:
 * case MANAGE_SELL_OFFER_BUY_NO_TRUST:
 * case MANAGE_SELL_OFFER_SELL_NOT_AUTHORIZED:
 * case MANAGE_SELL_OFFER_BUY_NOT_AUTHORIZED:
 * case MANAGE_SELL_OFFER_LINE_FULL:
 * case MANAGE_SELL_OFFER_UNDERFUNDED:
 * case MANAGE_SELL_OFFER_CROSS_SELF:
 * case MANAGE_SELL_OFFER_SELL_NO_ISSUER:
 * case MANAGE_SELL_OFFER_BUY_NO_ISSUER:
 * case MANAGE_SELL_OFFER_NOT_FOUND:
 * case MANAGE_SELL_OFFER_LOW_RESERVE:
 *     void;
 * };
 * ```
 */
abstract class ManageSellOfferResultBase extends XdrValue {
  abstract readonly type: ManageSellOfferResultVariantName;

  static readonly schema: XdrType<ManageSellOfferResultWire> = union(
    "ManageSellOfferResult",
    {
      switchOn: ManageSellOfferResultCode.schema,
      cases: [
        case_(
          "manageSellOfferSuccess",
          0,
          field("success", ManageOfferSuccessResult.schema),
        ),
        case_("manageSellOfferMalformed", -1, voidType()),
        case_("manageSellOfferSellNoTrust", -2, voidType()),
        case_("manageSellOfferBuyNoTrust", -3, voidType()),
        case_("manageSellOfferSellNotAuthorized", -4, voidType()),
        case_("manageSellOfferBuyNotAuthorized", -5, voidType()),
        case_("manageSellOfferLineFull", -6, voidType()),
        case_("manageSellOfferUnderfunded", -7, voidType()),
        case_("manageSellOfferCrossSelf", -8, voidType()),
        case_("manageSellOfferSellNoIssuer", -9, voidType()),
        case_("manageSellOfferBuyNoIssuer", -10, voidType()),
        case_("manageSellOfferNotFound", -11, voidType()),
        case_("manageSellOfferLowReserve", -12, voidType()),
      ],
      switchKey: "code",
    },
  );

  static manageSellOfferSuccess(
    success: ManageOfferSuccessResult,
  ): ManageSellOfferResultSuccess {
    return new ManageSellOfferResultSuccess(success);
  }

  static manageSellOfferMalformed(): ManageSellOfferResultMalformed {
    return new ManageSellOfferResultMalformed();
  }

  static manageSellOfferSellNoTrust(): ManageSellOfferResultSellNoTrust {
    return new ManageSellOfferResultSellNoTrust();
  }

  static manageSellOfferBuyNoTrust(): ManageSellOfferResultBuyNoTrust {
    return new ManageSellOfferResultBuyNoTrust();
  }

  static manageSellOfferSellNotAuthorized(): ManageSellOfferResultSellNotAuthorized {
    return new ManageSellOfferResultSellNotAuthorized();
  }

  static manageSellOfferBuyNotAuthorized(): ManageSellOfferResultBuyNotAuthorized {
    return new ManageSellOfferResultBuyNotAuthorized();
  }

  static manageSellOfferLineFull(): ManageSellOfferResultLineFull {
    return new ManageSellOfferResultLineFull();
  }

  static manageSellOfferUnderfunded(): ManageSellOfferResultUnderfunded {
    return new ManageSellOfferResultUnderfunded();
  }

  static manageSellOfferCrossSelf(): ManageSellOfferResultCrossSelf {
    return new ManageSellOfferResultCrossSelf();
  }

  static manageSellOfferSellNoIssuer(): ManageSellOfferResultSellNoIssuer {
    return new ManageSellOfferResultSellNoIssuer();
  }

  static manageSellOfferBuyNoIssuer(): ManageSellOfferResultBuyNoIssuer {
    return new ManageSellOfferResultBuyNoIssuer();
  }

  static manageSellOfferNotFound(): ManageSellOfferResultNotFound {
    return new ManageSellOfferResultNotFound();
  }

  static manageSellOfferLowReserve(): ManageSellOfferResultLowReserve {
    return new ManageSellOfferResultLowReserve();
  }

  static fromXdrObject(wire: ManageSellOfferResultWire): ManageSellOfferResult {
    switch (wire.code) {
      case 0:
        return new ManageSellOfferResultSuccess(
          ManageOfferSuccessResult.fromXdrObject(wire.success),
        );
      case -1:
        return new ManageSellOfferResultMalformed();
      case -2:
        return new ManageSellOfferResultSellNoTrust();
      case -3:
        return new ManageSellOfferResultBuyNoTrust();
      case -4:
        return new ManageSellOfferResultSellNotAuthorized();
      case -5:
        return new ManageSellOfferResultBuyNotAuthorized();
      case -6:
        return new ManageSellOfferResultLineFull();
      case -7:
        return new ManageSellOfferResultUnderfunded();
      case -8:
        return new ManageSellOfferResultCrossSelf();
      case -9:
        return new ManageSellOfferResultSellNoIssuer();
      case -10:
        return new ManageSellOfferResultBuyNoIssuer();
      case -11:
        return new ManageSellOfferResultNotFound();
      case -12:
        return new ManageSellOfferResultLowReserve();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ManageSellOfferResult variant.
   * Use this instead of `instanceof ManageSellOfferResult`: the exported `ManageSellOfferResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ManageSellOfferResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ManageSellOfferResult {
    return value instanceof ManageSellOfferResultBase;
  }

  abstract toXdrObject(): ManageSellOfferResultWire;
}

export class ManageSellOfferResultSuccess extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferSuccess" as const;
  readonly success: ManageOfferSuccessResult;

  constructor(success: ManageOfferSuccessResult) {
    super();
    this.success = success;
  }

  get value(): ManageOfferSuccessResult {
    return this.success;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: 0 }> {
    return { code: 0, success: this.success.toXdrObject() };
  }
}

export class ManageSellOfferResultMalformed extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ManageSellOfferResultSellNoTrust extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferSellNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ManageSellOfferResultBuyNoTrust extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferBuyNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ManageSellOfferResultSellNotAuthorized extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferSellNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class ManageSellOfferResultBuyNotAuthorized extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferBuyNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class ManageSellOfferResultLineFull extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class ManageSellOfferResultUnderfunded extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class ManageSellOfferResultCrossSelf extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferCrossSelf" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class ManageSellOfferResultSellNoIssuer extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferSellNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export class ManageSellOfferResultBuyNoIssuer extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferBuyNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class ManageSellOfferResultNotFound extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferNotFound" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class ManageSellOfferResultLowReserve extends ManageSellOfferResultBase {
  readonly type = "manageSellOfferLowReserve" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageSellOfferResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export type ManageSellOfferResult =
  | ManageSellOfferResultSuccess
  | ManageSellOfferResultMalformed
  | ManageSellOfferResultSellNoTrust
  | ManageSellOfferResultBuyNoTrust
  | ManageSellOfferResultSellNotAuthorized
  | ManageSellOfferResultBuyNotAuthorized
  | ManageSellOfferResultLineFull
  | ManageSellOfferResultUnderfunded
  | ManageSellOfferResultCrossSelf
  | ManageSellOfferResultSellNoIssuer
  | ManageSellOfferResultBuyNoIssuer
  | ManageSellOfferResultNotFound
  | ManageSellOfferResultLowReserve;
export const ManageSellOfferResult = ManageSellOfferResultBase;
