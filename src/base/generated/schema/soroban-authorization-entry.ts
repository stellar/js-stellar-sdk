// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanAuthorizedInvocation } from "./soroban-authorized-invocation.js";
import { SorobanCredentials } from "./soroban-credentials.js";
export interface SorobanAuthorizationEntry {
  readonly credentials: SorobanCredentials;
  readonly rootInvocation: SorobanAuthorizedInvocation;
}
export const SorobanAuthorizationEntry = xdr.struct(
  "SorobanAuthorizationEntry",
  {
    credentials: xdr.lazy(() => SorobanCredentials),
    rootInvocation: xdr.lazy(() => SorobanAuthorizedInvocation),
  },
) as xdr.XdrType<SorobanAuthorizationEntry>;
