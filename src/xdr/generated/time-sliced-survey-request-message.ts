import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  SurveyRequestMessage,
  type SurveyRequestMessageWire,
} from "./survey-request-message.js";

export interface TimeSlicedSurveyRequestMessageWire {
  request: SurveyRequestMessageWire;
  nonce: number;
  inboundPeersIndex: number;
  outboundPeersIndex: number;
}

/**
 * ```xdr
 * struct TimeSlicedSurveyRequestMessage
 * {
 *     SurveyRequestMessage request;
 *     uint32 nonce;
 *     uint32 inboundPeersIndex;
 *     uint32 outboundPeersIndex;
 * };
 * ```
 */
export class TimeSlicedSurveyRequestMessage extends XdrValue {
  readonly request: SurveyRequestMessage;
  readonly nonce: number;
  readonly inboundPeersIndex: number;
  readonly outboundPeersIndex: number;

  static readonly schema: XdrType<TimeSlicedSurveyRequestMessageWire> = struct(
    "TimeSlicedSurveyRequestMessage",
    {
      request: SurveyRequestMessage.schema,
      nonce: uint32(),
      inboundPeersIndex: uint32(),
      outboundPeersIndex: uint32(),
    },
  );

  constructor(input: {
    request: SurveyRequestMessage;
    nonce: number;
    inboundPeersIndex: number;
    outboundPeersIndex: number;
  }) {
    super();
    this.request = input.request;
    this.nonce = input.nonce;
    this.inboundPeersIndex = input.inboundPeersIndex;
    this.outboundPeersIndex = input.outboundPeersIndex;
  }

  toXdrObject(): TimeSlicedSurveyRequestMessageWire {
    return {
      request: this.request.toXdrObject(),
      nonce: this.nonce,
      inboundPeersIndex: this.inboundPeersIndex,
      outboundPeersIndex: this.outboundPeersIndex,
    };
  }

  static fromXdrObject(
    wire: TimeSlicedSurveyRequestMessageWire,
  ): TimeSlicedSurveyRequestMessage {
    return new TimeSlicedSurveyRequestMessage({
      request: SurveyRequestMessage.fromXdrObject(wire.request),
      nonce: wire.nonce,
      inboundPeersIndex: wire.inboundPeersIndex,
      outboundPeersIndex: wire.outboundPeersIndex,
    });
  }
}
