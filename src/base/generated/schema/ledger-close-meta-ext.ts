// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerCloseMetaExtV1 } from "./ledger-close-meta-ext-v1.js";
export type LedgerCloseMetaExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: LedgerCloseMetaExtV1;
    };
export const LedgerCloseMetaExt = xdr.union("LedgerCloseMetaExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => LedgerCloseMetaExtV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerCloseMetaExt>;
