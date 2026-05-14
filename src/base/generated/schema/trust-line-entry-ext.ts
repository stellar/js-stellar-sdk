// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TrustLineEntryV1 } from "./trust-line-entry-v1.js";
export type TrustLineEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: TrustLineEntryV1;
    };
export const TrustLineEntryExt = xdr.union("TrustLineEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => TrustLineEntryV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TrustLineEntryExt>;
