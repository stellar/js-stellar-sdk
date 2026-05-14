// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BucketMetadata } from "./bucket-metadata.js";
import { HotArchiveBucketEntryType } from "./hot-archive-bucket-entry-type.js";
import { LedgerEntry } from "./ledger-entry.js";
import { LedgerKey } from "./ledger-key.js";
export type HotArchiveBucketEntry =
  | {
      readonly type: 0;
      readonly archivedEntry: LedgerEntry;
    }
  | {
      readonly type: 1;
      readonly key: LedgerKey;
    }
  | {
      readonly type: -1;
      readonly metaEntry: BucketMetadata;
    };
export const HotArchiveBucketEntry = xdr.union("HotArchiveBucketEntry", {
  switchOn: xdr.lazy(() => HotArchiveBucketEntryType),
  switchKey: "type",
  cases: [
    xdr.case(
      "hotArchiveArchived",
      0,
      xdr.field(
        "archivedEntry",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "hotArchiveLive",
      1,
      xdr.field(
        "key",
        xdr.lazy(() => LedgerKey),
      ),
    ),
    xdr.case(
      "hotArchiveMetaentry",
      -1,
      xdr.field(
        "metaEntry",
        xdr.lazy(() => BucketMetadata),
      ),
    ),
  ] as const,
}) as xdr.XdrType<HotArchiveBucketEntry>;
