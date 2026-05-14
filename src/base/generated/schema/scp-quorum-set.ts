// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { NodeId } from "./node-id.js";
export interface SCPQuorumSet {
  readonly threshold: number;
  readonly validators: NodeId[];
  readonly innerSets: SCPQuorumSet[];
}
export const SCPQuorumSet = xdr.struct("SCPQuorumSet", {
  threshold: xdr.uint32(),
  validators: xdr.array(
    xdr.lazy(() => NodeId),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  innerSets: xdr.array(
    xdr.lazy(() => SCPQuorumSet),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCPQuorumSet>;
