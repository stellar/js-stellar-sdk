// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SetOptionsResultCode } from "./set-options-result-code.js";
export type SetOptionsResult =
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
    }
  | {
      readonly code: -10;
    };
export const SetOptionsResult = xdr.union("SetOptionsResult", {
  switchOn: xdr.lazy(() => SetOptionsResultCode),
  switchKey: "code",
  cases: [
    xdr.case("setOptionsSuccess", 0, xdr.void()),
    xdr.case("setOptionsLowReserve", -1, xdr.void()),
    xdr.case("setOptionsTooManySigners", -2, xdr.void()),
    xdr.case("setOptionsBadFlags", -3, xdr.void()),
    xdr.case("setOptionsInvalidInflation", -4, xdr.void()),
    xdr.case("setOptionsCantChange", -5, xdr.void()),
    xdr.case("setOptionsUnknownFlag", -6, xdr.void()),
    xdr.case("setOptionsThresholdOutOfRange", -7, xdr.void()),
    xdr.case("setOptionsBadSigner", -8, xdr.void()),
    xdr.case("setOptionsInvalidHomeDomain", -9, xdr.void()),
    xdr.case("setOptionsAuthRevocableRequired", -10, xdr.void()),
  ] as const,
}) as xdr.XdrType<SetOptionsResult>;
