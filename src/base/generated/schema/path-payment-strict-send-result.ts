// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { PathPaymentStrictSendResultCode } from "./path-payment-strict-send-result-code.js";
import { PathPaymentStrictSendResultSuccess } from "./path-payment-strict-send-result-success.js";
export type PathPaymentStrictSendResult =
  | {
      readonly code: 0;
      readonly success: PathPaymentStrictSendResultSuccess;
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
      readonly noIssuer: Asset;
    }
  | {
      readonly code: -10;
    }
  | {
      readonly code: -11;
    }
  | {
      readonly code: -12;
    };
export const PathPaymentStrictSendResult = xdr.union(
  "PathPaymentStrictSendResult",
  {
    switchOn: xdr.lazy(() => PathPaymentStrictSendResultCode),
    switchKey: "code",
    cases: [
      xdr.case(
        "pathPaymentStrictSendSuccess",
        0,
        xdr.field(
          "success",
          xdr.lazy(() => PathPaymentStrictSendResultSuccess),
        ),
      ),
      xdr.case("pathPaymentStrictSendMalformed", -1, xdr.void()),
      xdr.case("pathPaymentStrictSendUnderfunded", -2, xdr.void()),
      xdr.case("pathPaymentStrictSendSrcNoTrust", -3, xdr.void()),
      xdr.case("pathPaymentStrictSendSrcNotAuthorized", -4, xdr.void()),
      xdr.case("pathPaymentStrictSendNoDestination", -5, xdr.void()),
      xdr.case("pathPaymentStrictSendNoTrust", -6, xdr.void()),
      xdr.case("pathPaymentStrictSendNotAuthorized", -7, xdr.void()),
      xdr.case("pathPaymentStrictSendLineFull", -8, xdr.void()),
      xdr.case(
        "pathPaymentStrictSendNoIssuer",
        -9,
        xdr.field(
          "noIssuer",
          xdr.lazy(() => Asset),
        ),
      ),
      xdr.case("pathPaymentStrictSendTooFewOffers", -10, xdr.void()),
      xdr.case("pathPaymentStrictSendOfferCrossSelf", -11, xdr.void()),
      xdr.case("pathPaymentStrictSendUnderDestmin", -12, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<PathPaymentStrictSendResult>;
