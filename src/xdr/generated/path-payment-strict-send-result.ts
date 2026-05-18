/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PathPaymentStrictSendResultCode } from "./path-payment-strict-send-result-code.js";
import {
  PathPaymentStrictSendResultSuccess,
  type PathPaymentStrictSendResultSuccessWire,
} from "./path-payment-strict-send-result-success.js";
import { Asset, type AssetWire } from "./asset.js";

export type PathPaymentStrictSendResultWire =
  | { code: 0; success: PathPaymentStrictSendResultSuccessWire }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 }
  | { code: -9; noIssuer: AssetWire }
  | { code: -10 }
  | { code: -11 }
  | { code: -12 };

export type PathPaymentStrictSendResultVariantName =
  | "pathPaymentStrictSendSuccess"
  | "pathPaymentStrictSendMalformed"
  | "pathPaymentStrictSendUnderfunded"
  | "pathPaymentStrictSendSrcNoTrust"
  | "pathPaymentStrictSendSrcNotAuthorized"
  | "pathPaymentStrictSendNoDestination"
  | "pathPaymentStrictSendNoTrust"
  | "pathPaymentStrictSendNotAuthorized"
  | "pathPaymentStrictSendLineFull"
  | "pathPaymentStrictSendNoIssuer"
  | "pathPaymentStrictSendTooFewOffers"
  | "pathPaymentStrictSendOfferCrossSelf"
  | "pathPaymentStrictSendUnderDestmin";

/**
 * ```xdr
 * union PathPaymentStrictSendResult switch (PathPaymentStrictSendResultCode code)
 * {
 * case PATH_PAYMENT_STRICT_SEND_SUCCESS:
 *     struct
 *     {
 *         ClaimAtom offers<>;
 *         SimplePaymentResult last;
 *     } success;
 * case PATH_PAYMENT_STRICT_SEND_MALFORMED:
 * case PATH_PAYMENT_STRICT_SEND_UNDERFUNDED:
 * case PATH_PAYMENT_STRICT_SEND_SRC_NO_TRUST:
 * case PATH_PAYMENT_STRICT_SEND_SRC_NOT_AUTHORIZED:
 * case PATH_PAYMENT_STRICT_SEND_NO_DESTINATION:
 * case PATH_PAYMENT_STRICT_SEND_NO_TRUST:
 * case PATH_PAYMENT_STRICT_SEND_NOT_AUTHORIZED:
 * case PATH_PAYMENT_STRICT_SEND_LINE_FULL:
 *     void;
 * case PATH_PAYMENT_STRICT_SEND_NO_ISSUER:
 *     Asset noIssuer; // the asset that caused the error
 * case PATH_PAYMENT_STRICT_SEND_TOO_FEW_OFFERS:
 * case PATH_PAYMENT_STRICT_SEND_OFFER_CROSS_SELF:
 * case PATH_PAYMENT_STRICT_SEND_UNDER_DESTMIN:
 *     void;
 * };
 * ```
 */
abstract class PathPaymentStrictSendResultBase extends XdrValue {
  abstract readonly type: PathPaymentStrictSendResultVariantName;

  static readonly schema: XdrType<PathPaymentStrictSendResultWire> = union(
    "PathPaymentStrictSendResult",
    {
      switchOn: PathPaymentStrictSendResultCode.schema,
      cases: [
        case_(
          "pathPaymentStrictSendSuccess",
          0,
          field("success", PathPaymentStrictSendResultSuccess.schema),
        ),
        case_("pathPaymentStrictSendMalformed", -1, voidType()),
        case_("pathPaymentStrictSendUnderfunded", -2, voidType()),
        case_("pathPaymentStrictSendSrcNoTrust", -3, voidType()),
        case_("pathPaymentStrictSendSrcNotAuthorized", -4, voidType()),
        case_("pathPaymentStrictSendNoDestination", -5, voidType()),
        case_("pathPaymentStrictSendNoTrust", -6, voidType()),
        case_("pathPaymentStrictSendNotAuthorized", -7, voidType()),
        case_("pathPaymentStrictSendLineFull", -8, voidType()),
        case_(
          "pathPaymentStrictSendNoIssuer",
          -9,
          field("noIssuer", Asset.schema),
        ),
        case_("pathPaymentStrictSendTooFewOffers", -10, voidType()),
        case_("pathPaymentStrictSendOfferCrossSelf", -11, voidType()),
        case_("pathPaymentStrictSendUnderDestmin", -12, voidType()),
      ],
      switchKey: "code",
    },
  );

  static pathPaymentStrictSendSuccess(
    success: PathPaymentStrictSendResultSuccess,
  ): PathPaymentStrictSendResultSuccessArm {
    return new PathPaymentStrictSendResultSuccessArm(success);
  }

  static pathPaymentStrictSendMalformed(): PathPaymentStrictSendResultMalformed {
    return new PathPaymentStrictSendResultMalformed();
  }

  static pathPaymentStrictSendUnderfunded(): PathPaymentStrictSendResultUnderfunded {
    return new PathPaymentStrictSendResultUnderfunded();
  }

  static pathPaymentStrictSendSrcNoTrust(): PathPaymentStrictSendResultSrcNoTrust {
    return new PathPaymentStrictSendResultSrcNoTrust();
  }

  static pathPaymentStrictSendSrcNotAuthorized(): PathPaymentStrictSendResultSrcNotAuthorized {
    return new PathPaymentStrictSendResultSrcNotAuthorized();
  }

  static pathPaymentStrictSendNoDestination(): PathPaymentStrictSendResultNoDestination {
    return new PathPaymentStrictSendResultNoDestination();
  }

  static pathPaymentStrictSendNoTrust(): PathPaymentStrictSendResultNoTrust {
    return new PathPaymentStrictSendResultNoTrust();
  }

  static pathPaymentStrictSendNotAuthorized(): PathPaymentStrictSendResultNotAuthorized {
    return new PathPaymentStrictSendResultNotAuthorized();
  }

  static pathPaymentStrictSendLineFull(): PathPaymentStrictSendResultLineFull {
    return new PathPaymentStrictSendResultLineFull();
  }

  static pathPaymentStrictSendNoIssuer(
    noIssuer: Asset,
  ): PathPaymentStrictSendResultNoIssuer {
    return new PathPaymentStrictSendResultNoIssuer(noIssuer);
  }

  static pathPaymentStrictSendTooFewOffers(): PathPaymentStrictSendResultTooFewOffers {
    return new PathPaymentStrictSendResultTooFewOffers();
  }

  static pathPaymentStrictSendOfferCrossSelf(): PathPaymentStrictSendResultOfferCrossSelf {
    return new PathPaymentStrictSendResultOfferCrossSelf();
  }

  static pathPaymentStrictSendUnderDestmin(): PathPaymentStrictSendResultUnderDestmin {
    return new PathPaymentStrictSendResultUnderDestmin();
  }

  static fromXdrObject(
    wire: PathPaymentStrictSendResultWire,
  ): PathPaymentStrictSendResult {
    switch (wire.code) {
      case 0:
        return new PathPaymentStrictSendResultSuccessArm(
          PathPaymentStrictSendResultSuccess.fromXdrObject(wire.success),
        );
      case -1:
        return new PathPaymentStrictSendResultMalformed();
      case -2:
        return new PathPaymentStrictSendResultUnderfunded();
      case -3:
        return new PathPaymentStrictSendResultSrcNoTrust();
      case -4:
        return new PathPaymentStrictSendResultSrcNotAuthorized();
      case -5:
        return new PathPaymentStrictSendResultNoDestination();
      case -6:
        return new PathPaymentStrictSendResultNoTrust();
      case -7:
        return new PathPaymentStrictSendResultNotAuthorized();
      case -8:
        return new PathPaymentStrictSendResultLineFull();
      case -9:
        return new PathPaymentStrictSendResultNoIssuer(
          Asset.fromXdrObject(wire.noIssuer),
        );
      case -10:
        return new PathPaymentStrictSendResultTooFewOffers();
      case -11:
        return new PathPaymentStrictSendResultOfferCrossSelf();
      case -12:
        return new PathPaymentStrictSendResultUnderDestmin();
    }
  }

  abstract toXdrObject(): PathPaymentStrictSendResultWire;
}

export class PathPaymentStrictSendResultSuccessArm extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendSuccess" as const;
  readonly success: PathPaymentStrictSendResultSuccess;

  constructor(success: PathPaymentStrictSendResultSuccess) {
    super();
    this.success = success;
  }

  get value(): PathPaymentStrictSendResultSuccess {
    return this.success;
  }

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: 0 }> {
    return { code: 0, success: this.success.toXdrObject() };
  }
}

export class PathPaymentStrictSendResultMalformed extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendMalformed" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class PathPaymentStrictSendResultUnderfunded extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendUnderfunded" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class PathPaymentStrictSendResultSrcNoTrust extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendSrcNoTrust" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class PathPaymentStrictSendResultSrcNotAuthorized extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendSrcNotAuthorized" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class PathPaymentStrictSendResultNoDestination extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendNoDestination" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class PathPaymentStrictSendResultNoTrust extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendNoTrust" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class PathPaymentStrictSendResultNotAuthorized extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendNotAuthorized" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class PathPaymentStrictSendResultLineFull extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendLineFull" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class PathPaymentStrictSendResultNoIssuer extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendNoIssuer" as const;
  readonly noIssuer: Asset;

  constructor(noIssuer: Asset) {
    super();
    this.noIssuer = noIssuer;
  }

  get value(): Asset {
    return this.noIssuer;
  }

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -9 }> {
    return { code: -9, noIssuer: this.noIssuer.toXdrObject() };
  }
}

export class PathPaymentStrictSendResultTooFewOffers extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendTooFewOffers" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class PathPaymentStrictSendResultOfferCrossSelf extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendOfferCrossSelf" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class PathPaymentStrictSendResultUnderDestmin extends PathPaymentStrictSendResultBase {
  readonly type = "pathPaymentStrictSendUnderDestmin" as const;

  toXdrObject(): Extract<PathPaymentStrictSendResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export type PathPaymentStrictSendResult =
  | PathPaymentStrictSendResultSuccessArm
  | PathPaymentStrictSendResultMalformed
  | PathPaymentStrictSendResultUnderfunded
  | PathPaymentStrictSendResultSrcNoTrust
  | PathPaymentStrictSendResultSrcNotAuthorized
  | PathPaymentStrictSendResultNoDestination
  | PathPaymentStrictSendResultNoTrust
  | PathPaymentStrictSendResultNotAuthorized
  | PathPaymentStrictSendResultLineFull
  | PathPaymentStrictSendResultNoIssuer
  | PathPaymentStrictSendResultTooFewOffers
  | PathPaymentStrictSendResultOfferCrossSelf
  | PathPaymentStrictSendResultUnderDestmin;
export const PathPaymentStrictSendResult = PathPaymentStrictSendResultBase;
