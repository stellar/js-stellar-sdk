// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PersistedSCPStateV0 } from "./persisted-scp-state-v0.js";
import { PersistedSCPStateV1 } from "./persisted-scp-state-v1.js";
export type PersistedSCPState =
  | {
      readonly v: 0;
      readonly v0: PersistedSCPStateV0;
    }
  | {
      readonly v: 1;
      readonly v1: PersistedSCPStateV1;
    };
export const PersistedSCPState = xdr.union("PersistedSCPState", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => PersistedSCPStateV0),
      ),
    ),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => PersistedSCPStateV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<PersistedSCPState>;
