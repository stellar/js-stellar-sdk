// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PeerStats } from "./peer-stats.js";
export interface TimeSlicedPeerData {
  readonly peerStats: PeerStats;
  readonly averageLatencyMs: number;
}
export const TimeSlicedPeerData = xdr.struct("TimeSlicedPeerData", {
  peerStats: xdr.lazy(() => PeerStats),
  averageLatencyMs: xdr.uint32(),
}) as xdr.XdrType<TimeSlicedPeerData>;
