import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type PathPaymentStrictReceiveResultCodeWire = number;

export type PathPaymentStrictReceiveResultCodeName =
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
 * enum PathPaymentStrictReceiveResultCode
 * {
 *     // codes considered as "success" for the operation
 *     PATH_PAYMENT_STRICT_RECEIVE_SUCCESS = 0, // success
 *
 *     // codes considered as "failure" for the operation
 *     PATH_PAYMENT_STRICT_RECEIVE_MALFORMED = -1, // bad input
 *     PATH_PAYMENT_STRICT_RECEIVE_UNDERFUNDED =
 *         -2, // not enough funds in source account
 *     PATH_PAYMENT_STRICT_RECEIVE_SRC_NO_TRUST =
 *         -3, // no trust line on source account
 *     PATH_PAYMENT_STRICT_RECEIVE_SRC_NOT_AUTHORIZED =
 *         -4, // source not authorized to transfer
 *     PATH_PAYMENT_STRICT_RECEIVE_NO_DESTINATION =
 *         -5, // destination account does not exist
 *     PATH_PAYMENT_STRICT_RECEIVE_NO_TRUST =
 *         -6, // dest missing a trust line for asset
 *     PATH_PAYMENT_STRICT_RECEIVE_NOT_AUTHORIZED =
 *         -7, // dest not authorized to hold asset
 *     PATH_PAYMENT_STRICT_RECEIVE_LINE_FULL =
 *         -8, // dest would go above their limit
 *     PATH_PAYMENT_STRICT_RECEIVE_NO_ISSUER = -9, // missing issuer on one asset
 *     PATH_PAYMENT_STRICT_RECEIVE_TOO_FEW_OFFERS =
 *         -10, // not enough offers to satisfy path
 *     PATH_PAYMENT_STRICT_RECEIVE_OFFER_CROSS_SELF =
 *         -11, // would cross one of its own offers
 *     PATH_PAYMENT_STRICT_RECEIVE_OVER_SENDMAX = -12 // could not satisfy sendmax
 * };
 * ```
 */
export class PathPaymentStrictReceiveResultCode extends EnumValue<PathPaymentStrictReceiveResultCodeName> {
  static readonly pathPaymentStrictReceiveSuccess =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveSuccess",
      0,
    );
  static readonly pathPaymentStrictReceiveMalformed =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveMalformed",
      -1,
    );
  static readonly pathPaymentStrictReceiveUnderfunded =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveUnderfunded",
      -2,
    );
  static readonly pathPaymentStrictReceiveSrcNoTrust =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveSrcNoTrust",
      -3,
    );
  static readonly pathPaymentStrictReceiveSrcNotAuthorized =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveSrcNotAuthorized",
      -4,
    );
  static readonly pathPaymentStrictReceiveNoDestination =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveNoDestination",
      -5,
    );
  static readonly pathPaymentStrictReceiveNoTrust =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveNoTrust",
      -6,
    );
  static readonly pathPaymentStrictReceiveNotAuthorized =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveNotAuthorized",
      -7,
    );
  static readonly pathPaymentStrictReceiveLineFull =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveLineFull",
      -8,
    );
  static readonly pathPaymentStrictReceiveNoIssuer =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveNoIssuer",
      -9,
    );
  static readonly pathPaymentStrictReceiveTooFewOffers =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveTooFewOffers",
      -10,
    );
  static readonly pathPaymentStrictReceiveOfferCrossSelf =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveOfferCrossSelf",
      -11,
    );
  static readonly pathPaymentStrictReceiveOverSendmax =
    new PathPaymentStrictReceiveResultCode(
      "pathPaymentStrictReceiveOverSendmax",
      -12,
    );

  static readonly schema = enumType("PathPaymentStrictReceiveResultCode", {
    pathPaymentStrictReceiveSuccess: 0,
    pathPaymentStrictReceiveMalformed: -1,
    pathPaymentStrictReceiveUnderfunded: -2,
    pathPaymentStrictReceiveSrcNoTrust: -3,
    pathPaymentStrictReceiveSrcNotAuthorized: -4,
    pathPaymentStrictReceiveNoDestination: -5,
    pathPaymentStrictReceiveNoTrust: -6,
    pathPaymentStrictReceiveNotAuthorized: -7,
    pathPaymentStrictReceiveLineFull: -8,
    pathPaymentStrictReceiveNoIssuer: -9,
    pathPaymentStrictReceiveTooFewOffers: -10,
    pathPaymentStrictReceiveOfferCrossSelf: -11,
    pathPaymentStrictReceiveOverSendmax: -12,
  });

  static fromValue(value: number): PathPaymentStrictReceiveResultCode {
    return enumFromValue(
      "PathPaymentStrictReceiveResultCode",
      PathPaymentStrictReceiveResultCode.schema,
      PathPaymentStrictReceiveResultCode,
      value,
    );
  }

  static fromName(
    name: PathPaymentStrictReceiveResultCodeName,
  ): PathPaymentStrictReceiveResultCode {
    return enumFromName(
      "PathPaymentStrictReceiveResultCode",
      PathPaymentStrictReceiveResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): PathPaymentStrictReceiveResultCode {
    return PathPaymentStrictReceiveResultCode.fromValue(wire);
  }
}
