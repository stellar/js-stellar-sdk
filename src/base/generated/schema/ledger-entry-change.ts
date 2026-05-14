// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntry } from "./ledger-entry.js";
import { LedgerEntryChangeType } from "./ledger-entry-change-type.js";
import { LedgerKey } from "./ledger-key.js";
export type LedgerEntryChange =
  | {
      readonly type: 0;
      readonly created: LedgerEntry;
    }
  | {
      readonly type: 1;
      readonly updated: LedgerEntry;
    }
  | {
      readonly type: 2;
      readonly removed: LedgerKey;
    }
  | {
      readonly type: 3;
      readonly state: LedgerEntry;
    }
  | {
      readonly type: 4;
      readonly restored: LedgerEntry;
    };
export const LedgerEntryChange = xdr.union("LedgerEntryChange", {
  switchOn: xdr.lazy(() => LedgerEntryChangeType),
  switchKey: "type",
  cases: [
    xdr.case(
      "ledgerEntryCreated",
      0,
      xdr.field(
        "created",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "ledgerEntryUpdated",
      1,
      xdr.field(
        "updated",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "ledgerEntryRemoved",
      2,
      xdr.field(
        "removed",
        xdr.lazy(() => LedgerKey),
      ),
    ),
    xdr.case(
      "ledgerEntryState",
      3,
      xdr.field(
        "state",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
    xdr.case(
      "ledgerEntryRestored",
      4,
      xdr.field(
        "restored",
        xdr.lazy(() => LedgerEntry),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerEntryChange>;
