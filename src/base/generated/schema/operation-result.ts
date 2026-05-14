// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { OperationResultCode } from "./operation-result-code.js";
import { OperationResultTr } from "./operation-result-tr.js";
export type OperationResult =
  | {
      readonly code: 0;
      readonly tr: OperationResultTr;
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
    };
export const OperationResult = xdr.union("OperationResult", {
  switchOn: xdr.lazy(() => OperationResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "opInner",
      0,
      xdr.field(
        "tr",
        xdr.lazy(() => OperationResultTr),
      ),
    ),
    xdr.case("opBadAuth", -1, xdr.void()),
    xdr.case("opNoAccount", -2, xdr.void()),
    xdr.case("opNotSupported", -3, xdr.void()),
    xdr.case("opTooManySubentries", -4, xdr.void()),
    xdr.case("opExceededWorkLimit", -5, xdr.void()),
    xdr.case("opTooManySponsoring", -6, xdr.void()),
  ] as const,
}) as xdr.XdrType<OperationResult>;
