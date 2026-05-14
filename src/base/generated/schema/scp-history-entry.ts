// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPHistoryEntryV0 } from "./scp-history-entry-v0.js";
export type SCPHistoryEntry = {
  readonly v: 0;
  readonly v0: SCPHistoryEntryV0;
};
export const SCPHistoryEntry = xdr.union("SCPHistoryEntry", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => SCPHistoryEntryV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCPHistoryEntry>;
