import { array, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TimeSlicedPeerData,
  type TimeSlicedPeerDataWire,
} from "./time-sliced-peer-data.js";
import {
  TimeSlicedNodeData,
  type TimeSlicedNodeDataWire,
} from "./time-sliced-node-data.js";

export interface TopologyResponseBodyV2Wire {
  inboundPeers: TimeSlicedPeerDataWire[];
  outboundPeers: TimeSlicedPeerDataWire[];
  nodeData: TimeSlicedNodeDataWire;
}

/**
 * ```xdr
 * struct TopologyResponseBodyV2
 * {
 *     TimeSlicedPeerDataList inboundPeers;
 *     TimeSlicedPeerDataList outboundPeers;
 *     TimeSlicedNodeData nodeData;
 * };
 * ```
 */
export class TopologyResponseBodyV2 extends XdrValue {
  readonly inboundPeers: TimeSlicedPeerData[];
  readonly outboundPeers: TimeSlicedPeerData[];
  readonly nodeData: TimeSlicedNodeData;

  static readonly schema: XdrType<TopologyResponseBodyV2Wire> = struct(
    "TopologyResponseBodyV2",
    {
      inboundPeers: array(TimeSlicedPeerData.schema, 25),
      outboundPeers: array(TimeSlicedPeerData.schema, 25),
      nodeData: TimeSlicedNodeData.schema,
    },
  );

  constructor(input: {
    inboundPeers: TimeSlicedPeerData[];
    outboundPeers: TimeSlicedPeerData[];
    nodeData: TimeSlicedNodeData;
  }) {
    super();
    this.inboundPeers = input.inboundPeers;
    this.outboundPeers = input.outboundPeers;
    this.nodeData = input.nodeData;
  }

  toXdrObject(): TopologyResponseBodyV2Wire {
    return {
      inboundPeers: this.inboundPeers.map((v) => v.toXdrObject()),
      outboundPeers: this.outboundPeers.map((v) => v.toXdrObject()),
      nodeData: this.nodeData.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: TopologyResponseBodyV2Wire,
  ): TopologyResponseBodyV2 {
    return new TopologyResponseBodyV2({
      inboundPeers: wire.inboundPeers.map((w) =>
        TimeSlicedPeerData.fromXdrObject(w),
      ),
      outboundPeers: wire.outboundPeers.map((w) =>
        TimeSlicedPeerData.fromXdrObject(w),
      ),
      nodeData: TimeSlicedNodeData.fromXdrObject(wire.nodeData),
    });
  }
}
