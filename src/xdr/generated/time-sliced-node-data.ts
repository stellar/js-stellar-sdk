import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import { bool } from "../types/bool.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface TimeSlicedNodeDataWire {
  addedAuthenticatedPeers: number;
  droppedAuthenticatedPeers: number;
  totalInboundPeerCount: number;
  totalOutboundPeerCount: number;
  p75ScpFirstToSelfLatencyMs: number;
  p75ScpSelfToOtherLatencyMs: number;
  lostSyncCount: number;
  isValidator: boolean;
  maxInboundPeerCount: number;
  maxOutboundPeerCount: number;
}

/**
 * ```xdr
 * struct TimeSlicedNodeData
 * {
 *     uint32 addedAuthenticatedPeers;
 *     uint32 droppedAuthenticatedPeers;
 *     uint32 totalInboundPeerCount;
 *     uint32 totalOutboundPeerCount;
 *
 *     // SCP stats
 *     uint32 p75SCPFirstToSelfLatencyMs;
 *     uint32 p75SCPSelfToOtherLatencyMs;
 *
 *     // How many times the node lost sync in the time slice
 *     uint32 lostSyncCount;
 *
 *     // Config data
 *     bool isValidator;
 *     uint32 maxInboundPeerCount;
 *     uint32 maxOutboundPeerCount;
 * };
 * ```
 */
export class TimeSlicedNodeData extends XdrValue {
  readonly addedAuthenticatedPeers: number;
  readonly droppedAuthenticatedPeers: number;
  readonly totalInboundPeerCount: number;
  readonly totalOutboundPeerCount: number;
  readonly p75ScpFirstToSelfLatencyMs: number;
  readonly p75ScpSelfToOtherLatencyMs: number;
  readonly lostSyncCount: number;
  readonly isValidator: boolean;
  readonly maxInboundPeerCount: number;
  readonly maxOutboundPeerCount: number;

  static readonly schema: XdrType<TimeSlicedNodeDataWire> = struct(
    "TimeSlicedNodeData",
    {
      addedAuthenticatedPeers: uint32(),
      droppedAuthenticatedPeers: uint32(),
      totalInboundPeerCount: uint32(),
      totalOutboundPeerCount: uint32(),
      p75ScpFirstToSelfLatencyMs: uint32(),
      p75ScpSelfToOtherLatencyMs: uint32(),
      lostSyncCount: uint32(),
      isValidator: bool(),
      maxInboundPeerCount: uint32(),
      maxOutboundPeerCount: uint32(),
    },
  );

  constructor(input: {
    addedAuthenticatedPeers: number;
    droppedAuthenticatedPeers: number;
    totalInboundPeerCount: number;
    totalOutboundPeerCount: number;
    p75ScpFirstToSelfLatencyMs: number;
    p75ScpSelfToOtherLatencyMs: number;
    lostSyncCount: number;
    isValidator: boolean;
    maxInboundPeerCount: number;
    maxOutboundPeerCount: number;
  }) {
    super();
    this.addedAuthenticatedPeers = input.addedAuthenticatedPeers;
    this.droppedAuthenticatedPeers = input.droppedAuthenticatedPeers;
    this.totalInboundPeerCount = input.totalInboundPeerCount;
    this.totalOutboundPeerCount = input.totalOutboundPeerCount;
    this.p75ScpFirstToSelfLatencyMs = input.p75ScpFirstToSelfLatencyMs;
    this.p75ScpSelfToOtherLatencyMs = input.p75ScpSelfToOtherLatencyMs;
    this.lostSyncCount = input.lostSyncCount;
    this.isValidator = input.isValidator;
    this.maxInboundPeerCount = input.maxInboundPeerCount;
    this.maxOutboundPeerCount = input.maxOutboundPeerCount;
  }

  toXdrObject(): TimeSlicedNodeDataWire {
    return {
      addedAuthenticatedPeers: this.addedAuthenticatedPeers,
      droppedAuthenticatedPeers: this.droppedAuthenticatedPeers,
      totalInboundPeerCount: this.totalInboundPeerCount,
      totalOutboundPeerCount: this.totalOutboundPeerCount,
      p75ScpFirstToSelfLatencyMs: this.p75ScpFirstToSelfLatencyMs,
      p75ScpSelfToOtherLatencyMs: this.p75ScpSelfToOtherLatencyMs,
      lostSyncCount: this.lostSyncCount,
      isValidator: this.isValidator,
      maxInboundPeerCount: this.maxInboundPeerCount,
      maxOutboundPeerCount: this.maxOutboundPeerCount,
    };
  }

  static fromXdrObject(wire: TimeSlicedNodeDataWire): TimeSlicedNodeData {
    return new TimeSlicedNodeData({
      addedAuthenticatedPeers: wire.addedAuthenticatedPeers,
      droppedAuthenticatedPeers: wire.droppedAuthenticatedPeers,
      totalInboundPeerCount: wire.totalInboundPeerCount,
      totalOutboundPeerCount: wire.totalOutboundPeerCount,
      p75ScpFirstToSelfLatencyMs: wire.p75ScpFirstToSelfLatencyMs,
      p75ScpSelfToOtherLatencyMs: wire.p75ScpSelfToOtherLatencyMs,
      lostSyncCount: wire.lostSyncCount,
      isValidator: wire.isValidator,
      maxInboundPeerCount: wire.maxInboundPeerCount,
      maxOutboundPeerCount: wire.maxOutboundPeerCount,
    });
  }
}
