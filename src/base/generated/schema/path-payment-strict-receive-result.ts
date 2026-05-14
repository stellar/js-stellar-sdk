// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { PathPaymentStrictReceiveResultCode } from "./path-payment-strict-receive-result-code.js";
import { PathPaymentStrictReceiveResultSuccess } from "./path-payment-strict-receive-result-success.js";
export type PathPaymentStrictReceiveResult =
  | {
      readonly code: 0;
      readonly success: PathPaymentStrictReceiveResultSuccess;
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
export const PathPaymentStrictReceiveResult = xdr.union(
  "PathPaymentStrictReceiveResult",
  {
    switchOn: xdr.lazy(() => PathPaymentStrictReceiveResultCode),
    switchKey: "code",
    cases: [
      xdr.case(
        "pathPaymentStrictReceiveSuccess",
        0,
        xdr.field(
          "success",
          xdr.lazy(() => PathPaymentStrictReceiveResultSuccess),
        ),
      ),
      xdr.case("pathPaymentStrictReceiveMalformed", -1, xdr.void()),
      xdr.case("pathPaymentStrictReceiveUnderfunded", -2, xdr.void()),
      xdr.case("pathPaymentStrictReceiveSrcNoTrust", -3, xdr.void()),
      xdr.case("pathPaymentStrictReceiveSrcNotAuthorized", -4, xdr.void()),
      xdr.case("pathPaymentStrictReceiveNoDestination", -5, xdr.void()),
      xdr.case("pathPaymentStrictReceiveNoTrust", -6, xdr.void()),
      xdr.case("pathPaymentStrictReceiveNotAuthorized", -7, xdr.void()),
      xdr.case("pathPaymentStrictReceiveLineFull", -8, xdr.void()),
      xdr.case(
        "pathPaymentStrictReceiveNoIssuer",
        -9,
        xdr.field(
          "noIssuer",
          xdr.lazy(() => Asset),
        ),
      ),
      xdr.case("pathPaymentStrictReceiveTooFewOffers", -10, xdr.void()),
      xdr.case("pathPaymentStrictReceiveOfferCrossSelf", -11, xdr.void()),
      xdr.case("pathPaymentStrictReceiveOverSendmax", -12, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<PathPaymentStrictReceiveResult>;
