// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const PaymentResultCode = xdr.enumType("PaymentResultCode", {
  paymentSuccess: 0,
  paymentMalformed: -1,
  paymentUnderfunded: -2,
  paymentSrcNoTrust: -3,
  paymentSrcNotAuthorized: -4,
  paymentNoDestination: -5,
  paymentNoTrust: -6,
  paymentNotAuthorized: -7,
  paymentLineFull: -8,
  paymentNoIssuer: -9,
} as const);
export type PaymentResultCode = xdr.Infer<typeof PaymentResultCode>;
