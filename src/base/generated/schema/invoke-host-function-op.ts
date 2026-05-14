// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { HostFunction } from "./host-function.js";
import { SorobanAuthorizationEntry } from "./soroban-authorization-entry.js";
export interface InvokeHostFunctionOp {
  readonly hostFunction: HostFunction;
  readonly auth: SorobanAuthorizationEntry[];
}
export const InvokeHostFunctionOp = xdr.struct("InvokeHostFunctionOp", {
  hostFunction: xdr.lazy(() => HostFunction),
  auth: xdr.array(
    xdr.lazy(() => SorobanAuthorizationEntry),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<InvokeHostFunctionOp>;
