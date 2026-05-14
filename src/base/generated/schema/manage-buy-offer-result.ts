// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ManageBuyOfferResultCode } from "./manage-buy-offer-result-code.js";
import { ManageOfferSuccessResult } from "./manage-offer-success-result.js";
export type ManageBuyOfferResult =
  | {
      readonly code: 0;
      readonly success: ManageOfferSuccessResult;
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
export const ManageBuyOfferResult = xdr.union("ManageBuyOfferResult", {
  switchOn: xdr.lazy(() => ManageBuyOfferResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "manageBuyOfferSuccess",
      0,
      xdr.field(
        "success",
        xdr.lazy(() => ManageOfferSuccessResult),
      ),
    ),
    xdr.case("manageBuyOfferMalformed", -1, xdr.void()),
    xdr.case("manageBuyOfferSellNoTrust", -2, xdr.void()),
    xdr.case("manageBuyOfferBuyNoTrust", -3, xdr.void()),
    xdr.case("manageBuyOfferSellNotAuthorized", -4, xdr.void()),
    xdr.case("manageBuyOfferBuyNotAuthorized", -5, xdr.void()),
    xdr.case("manageBuyOfferLineFull", -6, xdr.void()),
    xdr.case("manageBuyOfferUnderfunded", -7, xdr.void()),
    xdr.case("manageBuyOfferCrossSelf", -8, xdr.void()),
    xdr.case("manageBuyOfferSellNoIssuer", -9, xdr.void()),
    xdr.case("manageBuyOfferBuyNoIssuer", -10, xdr.void()),
    xdr.case("manageBuyOfferNotFound", -11, xdr.void()),
    xdr.case("manageBuyOfferLowReserve", -12, xdr.void()),
  ] as const,
}) as xdr.XdrType<ManageBuyOfferResult>;
