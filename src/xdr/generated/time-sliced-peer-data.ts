import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PeerStats, type PeerStatsWire } from "./peer-stats.js";

export interface TimeSlicedPeerDataWire {
  peerStats: PeerStatsWire;
  averageLatencyMs: number;
}

/**
 * ```xdr
 * struct TimeSlicedPeerData
 * {
 *     PeerStats peerStats;
 *     uint32 averageLatencyMs;
 * };
 * ```
 */
export class TimeSlicedPeerData extends XdrValue {
  readonly peerStats: PeerStats;
  readonly averageLatencyMs: number;

  static readonly schema: XdrType<TimeSlicedPeerDataWire> = struct(
    "TimeSlicedPeerData",
    {
      peerStats: PeerStats.schema,
      averageLatencyMs: uint32(),
    },
  );

  constructor(input: { peerStats: PeerStats; averageLatencyMs: number }) {
    super();
    this.peerStats = input.peerStats;
    this.averageLatencyMs = input.averageLatencyMs;
  }

  toXdrObject(): TimeSlicedPeerDataWire {
    return {
      peerStats: this.peerStats.toXdrObject(),
      averageLatencyMs: this.averageLatencyMs,
    };
  }

  static fromXdrObject(wire: TimeSlicedPeerDataWire): TimeSlicedPeerData {
    return new TimeSlicedPeerData({
      peerStats: PeerStats.fromXdrObject(wire.peerStats),
      averageLatencyMs: wire.averageLatencyMs,
    });
  }
}
