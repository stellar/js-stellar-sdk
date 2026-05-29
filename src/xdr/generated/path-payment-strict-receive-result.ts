/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PathPaymentStrictReceiveResultCode } from "./path-payment-strict-receive-result-code.js";
import {
  PathPaymentStrictReceiveResultSuccess,
  type PathPaymentStrictReceiveResultSuccessWire,
} from "./path-payment-strict-receive-result-success.js";
import { Asset, type AssetWire } from "./asset.js";

export type PathPaymentStrictReceiveResultWire =
  | { code: 0; success: PathPaymentStrictReceiveResultSuccessWire }
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

export type PathPaymentStrictReceiveResultVariantName =
  | "pathPaymentStrictReceiveSuccess"
  | "pathPaymentStrictReceiveMalformed"
  | "pathPaymentStrictReceiveUnderfunded"
  | "pathPaymentStrictReceiveSrcNoTrust"
  | "pathPaymentStrictReceiveSrcNotAuthorized"
  | "pathPaymentStrictReceiveNoDestination"
  | "pathPaymentStrictReceiveNoTrust"
  | "pathPaymentStrictReceiveNotAuthorized"
  | "pathPaymentStrictReceiveLineFull"
  | "pathPaymentStrictReceiveNoIssuer"
  | "pathPaymentStrictReceiveTooFewOffers"
  | "pathPaymentStrictReceiveOfferCrossSelf"
  | "pathPaymentStrictReceiveOverSendmax";

/**
 * ```xdr
 * union PathPaymentStrictReceiveResult switch (
 *     PathPaymentStrictReceiveResultCode code)
 * {
 * case PATH_PAYMENT_STRICT_RECEIVE_SUCCESS:
 *     struct
 *     {
 *         ClaimAtom offers<>;
 *         SimplePaymentResult last;
 *     } success;
 * case PATH_PAYMENT_STRICT_RECEIVE_MALFORMED:
 * case PATH_PAYMENT_STRICT_RECEIVE_UNDERFUNDED:
 * case PATH_PAYMENT_STRICT_RECEIVE_SRC_NO_TRUST:
 * case PATH_PAYMENT_STRICT_RECEIVE_SRC_NOT_AUTHORIZED:
 * case PATH_PAYMENT_STRICT_RECEIVE_NO_DESTINATION:
 * case PATH_PAYMENT_STRICT_RECEIVE_NO_TRUST:
 * case PATH_PAYMENT_STRICT_RECEIVE_NOT_AUTHORIZED:
 * case PATH_PAYMENT_STRICT_RECEIVE_LINE_FULL:
 *     void;
 * case PATH_PAYMENT_STRICT_RECEIVE_NO_ISSUER:
 *     Asset noIssuer; // the asset that caused the error
 * case PATH_PAYMENT_STRICT_RECEIVE_TOO_FEW_OFFERS:
 * case PATH_PAYMENT_STRICT_RECEIVE_OFFER_CROSS_SELF:
 * case PATH_PAYMENT_STRICT_RECEIVE_OVER_SENDMAX:
 *     void;
 * };
 * ```
 */
abstract class PathPaymentStrictReceiveResultBase extends XdrValue {
  abstract readonly type: PathPaymentStrictReceiveResultVariantName;

  static readonly schema: XdrType<PathPaymentStrictReceiveResultWire> = union(
    "PathPaymentStrictReceiveResult",
    {
      switchOn: PathPaymentStrictReceiveResultCode.schema,
      cases: [
        case_(
          "pathPaymentStrictReceiveSuccess",
          0,
          field("success", PathPaymentStrictReceiveResultSuccess.schema),
        ),
        case_("pathPaymentStrictReceiveMalformed", -1, voidType()),
        case_("pathPaymentStrictReceiveUnderfunded", -2, voidType()),
        case_("pathPaymentStrictReceiveSrcNoTrust", -3, voidType()),
        case_("pathPaymentStrictReceiveSrcNotAuthorized", -4, voidType()),
        case_("pathPaymentStrictReceiveNoDestination", -5, voidType()),
        case_("pathPaymentStrictReceiveNoTrust", -6, voidType()),
        case_("pathPaymentStrictReceiveNotAuthorized", -7, voidType()),
        case_("pathPaymentStrictReceiveLineFull", -8, voidType()),
        case_(
          "pathPaymentStrictReceiveNoIssuer",
          -9,
          field("noIssuer", Asset.schema),
        ),
        case_("pathPaymentStrictReceiveTooFewOffers", -10, voidType()),
        case_("pathPaymentStrictReceiveOfferCrossSelf", -11, voidType()),
        case_("pathPaymentStrictReceiveOverSendmax", -12, voidType()),
      ],
      switchKey: "code",
    },
  );

  static pathPaymentStrictReceiveSuccess(
    success: PathPaymentStrictReceiveResultSuccess,
  ): PathPaymentStrictReceiveResultSuccessArm {
    return new PathPaymentStrictReceiveResultSuccessArm(success);
  }

  static pathPaymentStrictReceiveMalformed(): PathPaymentStrictReceiveResultMalformed {
    return new PathPaymentStrictReceiveResultMalformed();
  }

  static pathPaymentStrictReceiveUnderfunded(): PathPaymentStrictReceiveResultUnderfunded {
    return new PathPaymentStrictReceiveResultUnderfunded();
  }

  static pathPaymentStrictReceiveSrcNoTrust(): PathPaymentStrictReceiveResultSrcNoTrust {
    return new PathPaymentStrictReceiveResultSrcNoTrust();
  }

  static pathPaymentStrictReceiveSrcNotAuthorized(): PathPaymentStrictReceiveResultSrcNotAuthorized {
    return new PathPaymentStrictReceiveResultSrcNotAuthorized();
  }

  static pathPaymentStrictReceiveNoDestination(): PathPaymentStrictReceiveResultNoDestination {
    return new PathPaymentStrictReceiveResultNoDestination();
  }

  static pathPaymentStrictReceiveNoTrust(): PathPaymentStrictReceiveResultNoTrust {
    return new PathPaymentStrictReceiveResultNoTrust();
  }

  static pathPaymentStrictReceiveNotAuthorized(): PathPaymentStrictReceiveResultNotAuthorized {
    return new PathPaymentStrictReceiveResultNotAuthorized();
  }

  static pathPaymentStrictReceiveLineFull(): PathPaymentStrictReceiveResultLineFull {
    return new PathPaymentStrictReceiveResultLineFull();
  }

  static pathPaymentStrictReceiveNoIssuer(
    noIssuer: Asset,
  ): PathPaymentStrictReceiveResultNoIssuer {
    return new PathPaymentStrictReceiveResultNoIssuer(noIssuer);
  }

  static pathPaymentStrictReceiveTooFewOffers(): PathPaymentStrictReceiveResultTooFewOffers {
    return new PathPaymentStrictReceiveResultTooFewOffers();
  }

  static pathPaymentStrictReceiveOfferCrossSelf(): PathPaymentStrictReceiveResultOfferCrossSelf {
    return new PathPaymentStrictReceiveResultOfferCrossSelf();
  }

  static pathPaymentStrictReceiveOverSendmax(): PathPaymentStrictReceiveResultOverSendmax {
    return new PathPaymentStrictReceiveResultOverSendmax();
  }

  static fromXdrObject(
    wire: PathPaymentStrictReceiveResultWire,
  ): PathPaymentStrictReceiveResult {
    switch (wire.code) {
      case 0:
        return new PathPaymentStrictReceiveResultSuccessArm(
          PathPaymentStrictReceiveResultSuccess.fromXdrObject(wire.success),
        );
      case -1:
        return new PathPaymentStrictReceiveResultMalformed();
      case -2:
        return new PathPaymentStrictReceiveResultUnderfunded();
      case -3:
        return new PathPaymentStrictReceiveResultSrcNoTrust();
      case -4:
        return new PathPaymentStrictReceiveResultSrcNotAuthorized();
      case -5:
        return new PathPaymentStrictReceiveResultNoDestination();
      case -6:
        return new PathPaymentStrictReceiveResultNoTrust();
      case -7:
        return new PathPaymentStrictReceiveResultNotAuthorized();
      case -8:
        return new PathPaymentStrictReceiveResultLineFull();
      case -9:
        return new PathPaymentStrictReceiveResultNoIssuer(
          Asset.fromXdrObject(wire.noIssuer),
        );
      case -10:
        return new PathPaymentStrictReceiveResultTooFewOffers();
      case -11:
        return new PathPaymentStrictReceiveResultOfferCrossSelf();
      case -12:
        return new PathPaymentStrictReceiveResultOverSendmax();
    }
  }

  abstract toXdrObject(): PathPaymentStrictReceiveResultWire;
}

export class PathPaymentStrictReceiveResultSuccessArm extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveSuccess" as const;
  readonly success: PathPaymentStrictReceiveResultSuccess;

  constructor(success: PathPaymentStrictReceiveResultSuccess) {
    super();
    this.success = success;
  }

  get value(): PathPaymentStrictReceiveResultSuccess {
    return this.success;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: 0 }> {
    return { code: 0, success: this.success.toXdrObject() };
  }
}

export class PathPaymentStrictReceiveResultMalformed extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class PathPaymentStrictReceiveResultUnderfunded extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class PathPaymentStrictReceiveResultSrcNoTrust extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveSrcNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class PathPaymentStrictReceiveResultSrcNotAuthorized extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveSrcNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class PathPaymentStrictReceiveResultNoDestination extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveNoDestination" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class PathPaymentStrictReceiveResultNoTrust extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class PathPaymentStrictReceiveResultNotAuthorized extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class PathPaymentStrictReceiveResultLineFull extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class PathPaymentStrictReceiveResultNoIssuer extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveNoIssuer" as const;
  readonly noIssuer: Asset;

  constructor(noIssuer: Asset) {
    super();
    this.noIssuer = noIssuer;
  }

  get value(): Asset {
    return this.noIssuer;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -9 }> {
    return { code: -9, noIssuer: this.noIssuer.toXdrObject() };
  }
}

export class PathPaymentStrictReceiveResultTooFewOffers extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveTooFewOffers" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class PathPaymentStrictReceiveResultOfferCrossSelf extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveOfferCrossSelf" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class PathPaymentStrictReceiveResultOverSendmax extends PathPaymentStrictReceiveResultBase {
  readonly type = "pathPaymentStrictReceiveOverSendmax" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PathPaymentStrictReceiveResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export type PathPaymentStrictReceiveResult =
  | PathPaymentStrictReceiveResultSuccessArm
  | PathPaymentStrictReceiveResultMalformed
  | PathPaymentStrictReceiveResultUnderfunded
  | PathPaymentStrictReceiveResultSrcNoTrust
  | PathPaymentStrictReceiveResultSrcNotAuthorized
  | PathPaymentStrictReceiveResultNoDestination
  | PathPaymentStrictReceiveResultNoTrust
  | PathPaymentStrictReceiveResultNotAuthorized
  | PathPaymentStrictReceiveResultLineFull
  | PathPaymentStrictReceiveResultNoIssuer
  | PathPaymentStrictReceiveResultTooFewOffers
  | PathPaymentStrictReceiveResultOfferCrossSelf
  | PathPaymentStrictReceiveResultOverSendmax;
export const PathPaymentStrictReceiveResult =
  PathPaymentStrictReceiveResultBase;
