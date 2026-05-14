// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { NodeId } from "./node-id.js";
import { SCPStatementPledges } from "./scp-statement-pledges.js";
export interface SCPStatement {
  readonly nodeId: NodeId;
  readonly slotIndex: bigint;
  readonly pledges: SCPStatementPledges;
}
export const SCPStatement = xdr.struct("SCPStatement", {
  nodeId: xdr.lazy(() => NodeId),
  slotIndex: xdr.uint64(),
  pledges: xdr.lazy(() => SCPStatementPledges),
}) as xdr.XdrType<SCPStatement>;
