// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ManageSellOfferResultCode = xdr.enumType(
  "ManageSellOfferResultCode",
  {
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
  } as const,
);
export type ManageSellOfferResultCode = xdr.Infer<
  typeof ManageSellOfferResultCode
>;
