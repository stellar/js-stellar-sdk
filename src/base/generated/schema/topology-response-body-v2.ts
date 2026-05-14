// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TimeSlicedNodeData } from "./time-sliced-node-data.js";
import { TimeSlicedPeerDataList } from "./time-sliced-peer-data-list.js";
export interface TopologyResponseBodyV2 {
  readonly inboundPeers: TimeSlicedPeerDataList;
  readonly outboundPeers: TimeSlicedPeerDataList;
  readonly nodeData: TimeSlicedNodeData;
}
export const TopologyResponseBodyV2 = xdr.struct("TopologyResponseBodyV2", {
  inboundPeers: xdr.lazy(() => TimeSlicedPeerDataList),
  outboundPeers: xdr.lazy(() => TimeSlicedPeerDataList),
  nodeData: xdr.lazy(() => TimeSlicedNodeData),
}) as xdr.XdrType<TopologyResponseBodyV2>;
