// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ManageDataResultCode } from "./manage-data-result-code.js";
export type ManageDataResult =
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
    };
export const ManageDataResult = xdr.union("ManageDataResult", {
  switchOn: xdr.lazy(() => ManageDataResultCode),
  switchKey: "code",
  cases: [
    xdr.case("manageDataSuccess", 0, xdr.void()),
    xdr.case("manageDataNotSupportedYet", -1, xdr.void()),
    xdr.case("manageDataNameNotFound", -2, xdr.void()),
    xdr.case("manageDataLowReserve", -3, xdr.void()),
    xdr.case("manageDataInvalidName", -4, xdr.void()),
  ] as const,
}) as xdr.XdrType<ManageDataResult>;
