// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PaymentResultCode } from "./payment-result-code.js";
export type PaymentResult =
  | {
      readonly code: 0;
    }
  | {
      readonly code: -1;
    }
  | {
      readonly code: -2;
    }
  | {
      readonly code: -3;
    }
  | {
      readonly code: -4;
    }
  | {
      readonly code: -5;
    }
  | {
      readonly code: -6;
    }
  | {
      readonly code: -7;
    }
  | {
      readonly code: -8;
    }
  | {
      readonly code: -9;
    };
export const PaymentResult = xdr.union("PaymentResult", {
  switchOn: xdr.lazy(() => PaymentResultCode),
  switchKey: "code",
  cases: [
    xdr.case("paymentSuccess", 0, xdr.void()),
    xdr.case("paymentMalformed", -1, xdr.void()),
    xdr.case("paymentUnderfunded", -2, xdr.void()),
    xdr.case("paymentSrcNoTrust", -3, xdr.void()),
    xdr.case("paymentSrcNotAuthorized", -4, xdr.void()),
    xdr.case("paymentNoDestination", -5, xdr.void()),
    xdr.case("paymentNoTrust", -6, xdr.void()),
    xdr.case("paymentNotAuthorized", -7, xdr.void()),
    xdr.case("paymentLineFull", -8, xdr.void()),
    xdr.case("paymentNoIssuer", -9, xdr.void()),
  ] as const,
}) as xdr.XdrType<PaymentResult>;
