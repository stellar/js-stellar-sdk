// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerCloseMetaV0 } from "./ledger-close-meta-v0.js";
import { LedgerCloseMetaV1 } from "./ledger-close-meta-v1.js";
import { LedgerCloseMetaV2 } from "./ledger-close-meta-v2.js";
export type LedgerCloseMeta =
  | {
      readonly v: 0;
      readonly v0: LedgerCloseMetaV0;
    }
  | {
      readonly v: 1;
      readonly v1: LedgerCloseMetaV1;
    }
  | {
      readonly v: 2;
      readonly v2: LedgerCloseMetaV2;
    };
export const LedgerCloseMeta = xdr.union("LedgerCloseMeta", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => LedgerCloseMetaV0),
      ),
    ),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => LedgerCloseMetaV1),
      ),
    ),
    xdr.case(
      "v2",
      2,
      xdr.field(
        "v2",
        xdr.lazy(() => LedgerCloseMetaV2),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerCloseMeta>;
