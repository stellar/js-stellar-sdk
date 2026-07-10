import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ManageSellOfferResultCodeWire = number;

export type ManageSellOfferResultCodeName =
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
 * enum ManageSellOfferResultCode
 * {
 *     // codes considered as "success" for the operation
 *     MANAGE_SELL_OFFER_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     MANAGE_SELL_OFFER_MALFORMED = -1, // generated offer would be invalid
 *     MANAGE_SELL_OFFER_SELL_NO_TRUST =
 *         -2,                              // no trust line for what we're selling
 *     MANAGE_SELL_OFFER_BUY_NO_TRUST = -3, // no trust line for what we're buying
 *     MANAGE_SELL_OFFER_SELL_NOT_AUTHORIZED = -4, // not authorized to sell
 *     MANAGE_SELL_OFFER_BUY_NOT_AUTHORIZED = -5,  // not authorized to buy
 *     MANAGE_SELL_OFFER_LINE_FULL = -6, // can't receive more of what it's buying
 *     MANAGE_SELL_OFFER_UNDERFUNDED = -7, // doesn't hold what it's trying to sell
 *     MANAGE_SELL_OFFER_CROSS_SELF =
 *         -8, // would cross an offer from the same user
 *     MANAGE_SELL_OFFER_SELL_NO_ISSUER = -9, // no issuer for what we're selling
 *     MANAGE_SELL_OFFER_BUY_NO_ISSUER = -10, // no issuer for what we're buying
 *
 *     // update errors
 *     MANAGE_SELL_OFFER_NOT_FOUND =
 *         -11, // offerID does not match an existing offer
 *
 *     MANAGE_SELL_OFFER_LOW_RESERVE =
 *         -12 // not enough funds to create a new Offer
 * };
 * ```
 */
export class ManageSellOfferResultCode extends EnumValue<ManageSellOfferResultCodeName> {
  static readonly manageSellOfferSuccess = new ManageSellOfferResultCode(
    "manageSellOfferSuccess",
    0,
  );
  static readonly manageSellOfferMalformed = new ManageSellOfferResultCode(
    "manageSellOfferMalformed",
    -1,
  );
  static readonly manageSellOfferSellNoTrust = new ManageSellOfferResultCode(
    "manageSellOfferSellNoTrust",
    -2,
  );
  static readonly manageSellOfferBuyNoTrust = new ManageSellOfferResultCode(
    "manageSellOfferBuyNoTrust",
    -3,
  );
  static readonly manageSellOfferSellNotAuthorized =
    new ManageSellOfferResultCode("manageSellOfferSellNotAuthorized", -4);
  static readonly manageSellOfferBuyNotAuthorized =
    new ManageSellOfferResultCode("manageSellOfferBuyNotAuthorized", -5);
  static readonly manageSellOfferLineFull = new ManageSellOfferResultCode(
    "manageSellOfferLineFull",
    -6,
  );
  static readonly manageSellOfferUnderfunded = new ManageSellOfferResultCode(
    "manageSellOfferUnderfunded",
    -7,
  );
  static readonly manageSellOfferCrossSelf = new ManageSellOfferResultCode(
    "manageSellOfferCrossSelf",
    -8,
  );
  static readonly manageSellOfferSellNoIssuer = new ManageSellOfferResultCode(
    "manageSellOfferSellNoIssuer",
    -9,
  );
  static readonly manageSellOfferBuyNoIssuer = new ManageSellOfferResultCode(
    "manageSellOfferBuyNoIssuer",
    -10,
  );
  static readonly manageSellOfferNotFound = new ManageSellOfferResultCode(
    "manageSellOfferNotFound",
    -11,
  );
  static readonly manageSellOfferLowReserve = new ManageSellOfferResultCode(
    "manageSellOfferLowReserve",
    -12,
  );

  static readonly schema = withMemberPrefix(
    enumType("ManageSellOfferResultCode", {
      manageSellOfferSuccess: 0,
      manageSellOfferMalformed: -1,
      manageSellOfferSellNoTrust: -2,
      manageSellOfferBuyNoTrust: -3,
      manageSellOfferSellNotAuthorized: -4,
      manageSellOfferBuyNotAuthorized: -5,
      manageSellOfferLineFull: -6,
      manageSellOfferUnderfunded: -7,
      manageSellOfferCrossSelf: -8,
      manageSellOfferSellNoIssuer: -9,
      manageSellOfferBuyNoIssuer: -10,
      manageSellOfferNotFound: -11,
      manageSellOfferLowReserve: -12,
    }),
    "manageSellOffer",
  );

  static fromValue(value: number): ManageSellOfferResultCode {
    return enumFromValue(
      "ManageSellOfferResultCode",
      ManageSellOfferResultCode.schema,
      ManageSellOfferResultCode,
      value,
    );
  }

  static fromName(
    name: ManageSellOfferResultCodeName,
  ): ManageSellOfferResultCode {
    return enumFromName(
      "ManageSellOfferResultCode",
      ManageSellOfferResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): ManageSellOfferResultCode {
    return ManageSellOfferResultCode.fromValue(wire);
  }
}
