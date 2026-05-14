// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BucketEntryType } from "./bucket-entry-type.js";
import { BucketMetadata } from "./bucket-metadata.js";
import { LedgerEntry } from "./ledger-entry.js";
import { LedgerKey } from "./ledger-key.js";
export type BucketEntry =
  | {
      readonly type: 0;
      readonly liveEntry: LedgerEntry;
    }
  | {
      readonly type: 2;
      readonly liveEntry: LedgerEntry;
    }
  | {
      readonly type: 1;
      readonly deadEntry: LedgerKey;
    }
  | {
      readonly type: -1;
      readonly metaEntry: BucketMetadata;
    };
export const BucketEntry = xdr.union("BucketEntry", {
  switchOn: xdr.lazy(() => BucketEntryType),
  switchKey: "type",
  cases: [
    xdr.case(
      "liveentry",
      0,
      xdr.field(
        "liveEntry",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "initentry",
      2,
      xdr.field(
        "liveEntry",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "deadentry",
      1,
      xdr.field(
        "deadEntry",
        xdr.lazy(() => LedgerKey),
      ),
    ),
    xdr.case(
      "metaentry",
      -1,
      xdr.field(
        "metaEntry",
        xdr.lazy(() => BucketMetadata),
      ),
    ),
  ] as const,
}) as xdr.XdrType<BucketEntry>;
