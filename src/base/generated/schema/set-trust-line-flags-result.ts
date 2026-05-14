// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SetTrustLineFlagsResultCode } from "./set-trust-line-flags-result-code.js";
export type SetTrustLineFlagsResult =
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
    };
export const SetTrustLineFlagsResult = xdr.union("SetTrustLineFlagsResult", {
  switchOn: xdr.lazy(() => SetTrustLineFlagsResultCode),
  switchKey: "code",
  cases: [
    xdr.case("setTrustLineFlagsSuccess", 0, xdr.void()),
    xdr.case("setTrustLineFlagsMalformed", -1, xdr.void()),
    xdr.case("setTrustLineFlagsNoTrustLine", -2, xdr.void()),
    xdr.case("setTrustLineFlagsCantRevoke", -3, xdr.void()),
    xdr.case("setTrustLineFlagsInvalidState", -4, xdr.void()),
    xdr.case("setTrustLineFlagsLowReserve", -5, xdr.void()),
  ] as const,
}) as xdr.XdrType<SetTrustLineFlagsResult>;
