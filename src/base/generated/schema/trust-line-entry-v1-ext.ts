// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TrustLineEntryExtensionV2 } from "./trust-line-entry-extension-v2.js";
export type TrustLineEntryV1Ext =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 2;
      readonly v2: TrustLineEntryExtensionV2;
    };
export const TrustLineEntryV1Ext = xdr.union("TrustLineEntryV1Ext", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v2",
      2,
      xdr.field(
        "v2",
        xdr.lazy(() => TrustLineEntryExtensionV2),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TrustLineEntryV1Ext>;
