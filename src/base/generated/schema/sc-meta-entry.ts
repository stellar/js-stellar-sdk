// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCMetaKind } from "./sc-meta-kind.js";
import { SCMetaV0 } from "./sc-meta-v0.js";
export type SCMetaEntry = {
  readonly kind: 0;
  readonly v0: SCMetaV0;
};
export const SCMetaEntry = xdr.union("SCMetaEntry", {
  switchOn: xdr.lazy(() => SCMetaKind),
  switchKey: "kind",
  cases: [
    xdr.case(
      "scMetaV0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => SCMetaV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCMetaEntry>;
