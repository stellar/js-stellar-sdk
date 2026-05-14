// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BumpSequenceResultCode } from "./bump-sequence-result-code.js";
export type BumpSequenceResult =
  | {
      readonly code: 0;
    }
  | {
      readonly code: -1;
    };
export const BumpSequenceResult = xdr.union("BumpSequenceResult", {
  switchOn: xdr.lazy(() => BumpSequenceResultCode),
  switchKey: "code",
  cases: [
    xdr.case("bumpSequenceSuccess", 0, xdr.void()),
    xdr.case("bumpSequenceBadSeq", -1, xdr.void()),
  ] as const,
}) as xdr.XdrType<BumpSequenceResult>;
