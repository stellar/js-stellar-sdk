// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface TimeSlicedNodeData {
  readonly addedAuthenticatedPeers: number;
  readonly droppedAuthenticatedPeers: number;
  readonly totalInboundPeerCount: number;
  readonly totalOutboundPeerCount: number;
  readonly p75SCPFirstToSelfLatencyMs: number;
  readonly p75SCPSelfToOtherLatencyMs: number;
  readonly lostSyncCount: number;
  readonly isValidator: boolean;
  readonly maxInboundPeerCount: number;
  readonly maxOutboundPeerCount: number;
}
export const TimeSlicedNodeData = xdr.struct("TimeSlicedNodeData", {
  addedAuthenticatedPeers: xdr.uint32(),
  droppedAuthenticatedPeers: xdr.uint32(),
  totalInboundPeerCount: xdr.uint32(),
  totalOutboundPeerCount: xdr.uint32(),
  p75SCPFirstToSelfLatencyMs: xdr.uint32(),
  p75SCPSelfToOtherLatencyMs: xdr.uint32(),
  lostSyncCount: xdr.uint32(),
  isValidator: xdr.bool(),
  maxInboundPeerCount: xdr.uint32(),
  maxOutboundPeerCount: xdr.uint32(),
}) as xdr.XdrType<TimeSlicedNodeData>;
