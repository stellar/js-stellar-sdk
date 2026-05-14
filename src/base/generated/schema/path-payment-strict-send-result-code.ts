// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const PathPaymentStrictSendResultCode = xdr.enumType(
  "PathPaymentStrictSendResultCode",
  {
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
  } as const,
);
export type PathPaymentStrictSendResultCode = xdr.Infer<
  typeof PathPaymentStrictSendResultCode
>;
