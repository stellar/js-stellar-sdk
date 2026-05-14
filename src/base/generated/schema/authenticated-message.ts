// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AuthenticatedMessageV0 } from "./authenticated-message-v0.js";
export type AuthenticatedMessage = {
  readonly v: 0;
  readonly v0: AuthenticatedMessageV0;
};
export const AuthenticatedMessage = xdr.union("AuthenticatedMessage", {
  switchOn: xdr.uint32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => AuthenticatedMessageV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<AuthenticatedMessage>;
