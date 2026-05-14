// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryExtensionV1 } from "./ledger-entry-extension-v1.js";
export type LedgerEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: LedgerEntryExtensionV1;
    };
export const LedgerEntryExt = xdr.union("LedgerEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => LedgerEntryExtensionV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerEntryExt>;
