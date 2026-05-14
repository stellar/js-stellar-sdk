// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCErrorCode } from "./sc-error-code.js";
import { SCErrorType } from "./sc-error-type.js";
export type SCError =
  | {
      readonly type: 0;
      readonly contractCode: number;
    }
  | {
      readonly type: 1;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 2;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 3;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 4;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 5;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 6;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 7;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 8;
      readonly code: SCErrorCode;
    }
  | {
      readonly type: 9;
      readonly code: SCErrorCode;
    };
export const SCError = xdr.union("SCError", {
  switchOn: xdr.lazy(() => SCErrorType),
  switchKey: "type",
  cases: [
    xdr.case("sceContract", 0, xdr.field("contractCode", xdr.uint32())),
    xdr.case(
      "sceWasmVm",
      1,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceContext",
      2,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceStorage",
      3,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceObject",
      4,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceCrypto",
      5,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceEvents",
      6,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceBudget",
      7,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceValue",
      8,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
    xdr.case(
      "sceAuth",
      9,
      xdr.field(
        "code",
        xdr.lazy(() => SCErrorCode),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCError>;
