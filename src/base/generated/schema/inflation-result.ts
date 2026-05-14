// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { InflationPayout } from "./inflation-payout.js";
import { InflationResultCode } from "./inflation-result-code.js";
export type InflationResult =
  | {
      readonly code: 0;
      readonly payouts: InflationPayout[];
    }
  | {
      readonly code: -1;
    };
export const InflationResult = xdr.union("InflationResult", {
  switchOn: xdr.lazy(() => InflationResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "inflationSuccess",
      0,
      xdr.field(
        "payouts",
        xdr.array(
          xdr.lazy(() => InflationPayout),
          xdr.UNBOUNDED_MAX_LENGTH,
        ),
      ),
    ),
    xdr.case("inflationNotTime", -1, xdr.void()),
  ] as const,
}) as xdr.XdrType<InflationResult>;
