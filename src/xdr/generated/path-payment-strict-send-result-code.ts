import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type PathPaymentStrictSendResultCodeWire = number;

export type PathPaymentStrictSendResultCodeName =
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
 * enum PathPaymentStrictSendResultCode
 * {
 *     // codes considered as "success" for the operation
 *     PATH_PAYMENT_STRICT_SEND_SUCCESS = 0, // success
 *
 *     // codes considered as "failure" for the operation
 *     PATH_PAYMENT_STRICT_SEND_MALFORMED = -1, // bad input
 *     PATH_PAYMENT_STRICT_SEND_UNDERFUNDED =
 *         -2, // not enough funds in source account
 *     PATH_PAYMENT_STRICT_SEND_SRC_NO_TRUST =
 *         -3, // no trust line on source account
 *     PATH_PAYMENT_STRICT_SEND_SRC_NOT_AUTHORIZED =
 *         -4, // source not authorized to transfer
 *     PATH_PAYMENT_STRICT_SEND_NO_DESTINATION =
 *         -5, // destination account does not exist
 *     PATH_PAYMENT_STRICT_SEND_NO_TRUST =
 *         -6, // dest missing a trust line for asset
 *     PATH_PAYMENT_STRICT_SEND_NOT_AUTHORIZED =
 *         -7, // dest not authorized to hold asset
 *     PATH_PAYMENT_STRICT_SEND_LINE_FULL = -8, // dest would go above their limit
 *     PATH_PAYMENT_STRICT_SEND_NO_ISSUER = -9, // missing issuer on one asset
 *     PATH_PAYMENT_STRICT_SEND_TOO_FEW_OFFERS =
 *         -10, // not enough offers to satisfy path
 *     PATH_PAYMENT_STRICT_SEND_OFFER_CROSS_SELF =
 *         -11, // would cross one of its own offers
 *     PATH_PAYMENT_STRICT_SEND_UNDER_DESTMIN = -12 // could not satisfy destMin
 * };
 * ```
 */
export class PathPaymentStrictSendResultCode extends EnumValue<PathPaymentStrictSendResultCodeName> {
  static readonly pathPaymentStrictSendSuccess =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendSuccess", 0);
  static readonly pathPaymentStrictSendMalformed =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendMalformed", -1);
  static readonly pathPaymentStrictSendUnderfunded =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendUnderfunded", -2);
  static readonly pathPaymentStrictSendSrcNoTrust =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendSrcNoTrust", -3);
  static readonly pathPaymentStrictSendSrcNotAuthorized =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendSrcNotAuthorized",
      -4,
    );
  static readonly pathPaymentStrictSendNoDestination =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendNoDestination",
      -5,
    );
  static readonly pathPaymentStrictSendNoTrust =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendNoTrust", -6);
  static readonly pathPaymentStrictSendNotAuthorized =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendNotAuthorized",
      -7,
    );
  static readonly pathPaymentStrictSendLineFull =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendLineFull", -8);
  static readonly pathPaymentStrictSendNoIssuer =
    new PathPaymentStrictSendResultCode("pathPaymentStrictSendNoIssuer", -9);
  static readonly pathPaymentStrictSendTooFewOffers =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendTooFewOffers",
      -10,
    );
  static readonly pathPaymentStrictSendOfferCrossSelf =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendOfferCrossSelf",
      -11,
    );
  static readonly pathPaymentStrictSendUnderDestmin =
    new PathPaymentStrictSendResultCode(
      "pathPaymentStrictSendUnderDestmin",
      -12,
    );

  static readonly schema = withMemberPrefix(
    enumType("PathPaymentStrictSendResultCode", {
      pathPaymentStrictSendSuccess: 0,
      pathPaymentStrictSendMalformed: -1,
      pathPaymentStrictSendUnderfunded: -2,
      pathPaymentStrictSendSrcNoTrust: -3,
      pathPaymentStrictSendSrcNotAuthorized: -4,
      pathPaymentStrictSendNoDestination: -5,
      pathPaymentStrictSendNoTrust: -6,
      pathPaymentStrictSendNotAuthorized: -7,
      pathPaymentStrictSendLineFull: -8,
      pathPaymentStrictSendNoIssuer: -9,
      pathPaymentStrictSendTooFewOffers: -10,
      pathPaymentStrictSendOfferCrossSelf: -11,
      pathPaymentStrictSendUnderDestmin: -12,
    }),
    "pathPaymentStrictSend",
  );

  static fromValue(value: number): PathPaymentStrictSendResultCode {
    return enumFromValue(
      "PathPaymentStrictSendResultCode",
      PathPaymentStrictSendResultCode.schema,
      PathPaymentStrictSendResultCode,
      value,
    );
  }

  static fromName(
    name: PathPaymentStrictSendResultCodeName,
  ): PathPaymentStrictSendResultCode {
    return enumFromName(
      "PathPaymentStrictSendResultCode",
      PathPaymentStrictSendResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): PathPaymentStrictSendResultCode {
    return PathPaymentStrictSendResultCode.fromValue(wire);
  }
}
