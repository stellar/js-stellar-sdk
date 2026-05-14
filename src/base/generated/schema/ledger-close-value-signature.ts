// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { NodeId } from "./node-id.js";
import { Signature } from "./signature.js";
export interface LedgerCloseValueSignature {
  readonly nodeId: NodeId;
  readonly signature: Signature;
}
export const LedgerCloseValueSignature = xdr.struct(
  "LedgerCloseValueSignature",
  {
    nodeId: xdr.lazy(() => NodeId),
    signature: xdr.lazy(() => Signature),
  },
) as xdr.XdrType<LedgerCloseValueSignature>;
