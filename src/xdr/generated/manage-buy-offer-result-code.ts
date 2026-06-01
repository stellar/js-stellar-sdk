import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ManageBuyOfferResultCodeWire = number;

export type ManageBuyOfferResultCodeName =
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
 * enum ManageBuyOfferResultCode
 * {
 *     // codes considered as "success" for the operation
 *     MANAGE_BUY_OFFER_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     MANAGE_BUY_OFFER_MALFORMED = -1,     // generated offer would be invalid
 *     MANAGE_BUY_OFFER_SELL_NO_TRUST = -2, // no trust line for what we're selling
 *     MANAGE_BUY_OFFER_BUY_NO_TRUST = -3,  // no trust line for what we're buying
 *     MANAGE_BUY_OFFER_SELL_NOT_AUTHORIZED = -4, // not authorized to sell
 *     MANAGE_BUY_OFFER_BUY_NOT_AUTHORIZED = -5,  // not authorized to buy
 *     MANAGE_BUY_OFFER_LINE_FULL = -6,   // can't receive more of what it's buying
 *     MANAGE_BUY_OFFER_UNDERFUNDED = -7, // doesn't hold what it's trying to sell
 *     MANAGE_BUY_OFFER_CROSS_SELF = -8, // would cross an offer from the same user
 *     MANAGE_BUY_OFFER_SELL_NO_ISSUER = -9, // no issuer for what we're selling
 *     MANAGE_BUY_OFFER_BUY_NO_ISSUER = -10, // no issuer for what we're buying
 *
 *     // update errors
 *     MANAGE_BUY_OFFER_NOT_FOUND =
 *         -11, // offerID does not match an existing offer
 *
 *     MANAGE_BUY_OFFER_LOW_RESERVE = -12 // not enough funds to create a new Offer
 * };
 * ```
 */
export class ManageBuyOfferResultCode extends EnumValue<ManageBuyOfferResultCodeName> {
  static readonly manageBuyOfferSuccess = new ManageBuyOfferResultCode(
    "manageBuyOfferSuccess",
    0,
  );
  static readonly manageBuyOfferMalformed = new ManageBuyOfferResultCode(
    "manageBuyOfferMalformed",
    -1,
  );
  static readonly manageBuyOfferSellNoTrust = new ManageBuyOfferResultCode(
    "manageBuyOfferSellNoTrust",
    -2,
  );
  static readonly manageBuyOfferBuyNoTrust = new ManageBuyOfferResultCode(
    "manageBuyOfferBuyNoTrust",
    -3,
  );
  static readonly manageBuyOfferSellNotAuthorized =
    new ManageBuyOfferResultCode("manageBuyOfferSellNotAuthorized", -4);
  static readonly manageBuyOfferBuyNotAuthorized = new ManageBuyOfferResultCode(
    "manageBuyOfferBuyNotAuthorized",
    -5,
  );
  static readonly manageBuyOfferLineFull = new ManageBuyOfferResultCode(
    "manageBuyOfferLineFull",
    -6,
  );
  static readonly manageBuyOfferUnderfunded = new ManageBuyOfferResultCode(
    "manageBuyOfferUnderfunded",
    -7,
  );
  static readonly manageBuyOfferCrossSelf = new ManageBuyOfferResultCode(
    "manageBuyOfferCrossSelf",
    -8,
  );
  static readonly manageBuyOfferSellNoIssuer = new ManageBuyOfferResultCode(
    "manageBuyOfferSellNoIssuer",
    -9,
  );
  static readonly manageBuyOfferBuyNoIssuer = new ManageBuyOfferResultCode(
    "manageBuyOfferBuyNoIssuer",
    -10,
  );
  static readonly manageBuyOfferNotFound = new ManageBuyOfferResultCode(
    "manageBuyOfferNotFound",
    -11,
  );
  static readonly manageBuyOfferLowReserve = new ManageBuyOfferResultCode(
    "manageBuyOfferLowReserve",
    -12,
  );

  static readonly schema = withMemberPrefix(
    enumType("ManageBuyOfferResultCode", {
      manageBuyOfferSuccess: 0,
      manageBuyOfferMalformed: -1,
      manageBuyOfferSellNoTrust: -2,
      manageBuyOfferBuyNoTrust: -3,
      manageBuyOfferSellNotAuthorized: -4,
      manageBuyOfferBuyNotAuthorized: -5,
      manageBuyOfferLineFull: -6,
      manageBuyOfferUnderfunded: -7,
      manageBuyOfferCrossSelf: -8,
      manageBuyOfferSellNoIssuer: -9,
      manageBuyOfferBuyNoIssuer: -10,
      manageBuyOfferNotFound: -11,
      manageBuyOfferLowReserve: -12,
    }),
    "manageBuyOffer",
  );

  static fromValue(value: number): ManageBuyOfferResultCode {
    return enumFromValue(
      "ManageBuyOfferResultCode",
      ManageBuyOfferResultCode.schema,
      ManageBuyOfferResultCode,
      value,
    );
  }

  static fromName(
    name: ManageBuyOfferResultCodeName,
  ): ManageBuyOfferResultCode {
    return enumFromName(
      "ManageBuyOfferResultCode",
      ManageBuyOfferResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): ManageBuyOfferResultCode {
    return ManageBuyOfferResultCode.fromValue(wire);
  }
}
