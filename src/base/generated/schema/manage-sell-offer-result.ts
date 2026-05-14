// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ManageOfferSuccessResult } from "./manage-offer-success-result.js";
import { ManageSellOfferResultCode } from "./manage-sell-offer-result-code.js";
export type ManageSellOfferResult =
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
export const ManageSellOfferResult = xdr.union("ManageSellOfferResult", {
  switchOn: xdr.lazy(() => ManageSellOfferResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "manageSellOfferSuccess",
      0,
      xdr.field(
        "success",
        xdr.lazy(() => ManageOfferSuccessResult),
      ),
    ),
    xdr.case("manageSellOfferMalformed", -1, xdr.void()),
    xdr.case("manageSellOfferSellNoTrust", -2, xdr.void()),
    xdr.case("manageSellOfferBuyNoTrust", -3, xdr.void()),
    xdr.case("manageSellOfferSellNotAuthorized", -4, xdr.void()),
    xdr.case("manageSellOfferBuyNotAuthorized", -5, xdr.void()),
    xdr.case("manageSellOfferLineFull", -6, xdr.void()),
    xdr.case("manageSellOfferUnderfunded", -7, xdr.void()),
    xdr.case("manageSellOfferCrossSelf", -8, xdr.void()),
    xdr.case("manageSellOfferSellNoIssuer", -9, xdr.void()),
    xdr.case("manageSellOfferBuyNoIssuer", -10, xdr.void()),
    xdr.case("manageSellOfferNotFound", -11, xdr.void()),
    xdr.case("manageSellOfferLowReserve", -12, xdr.void()),
  ] as const,
}) as xdr.XdrType<ManageSellOfferResult>;
