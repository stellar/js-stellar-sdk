// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerHeaderExtensionV1 } from "./ledger-header-extension-v1.js";
export type LedgerHeaderExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: LedgerHeaderExtensionV1;
    };
export const LedgerHeaderExt = xdr.union("LedgerHeaderExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => LedgerHeaderExtensionV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerHeaderExt>;
