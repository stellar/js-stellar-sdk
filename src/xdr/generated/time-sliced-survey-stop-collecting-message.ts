import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface TimeSlicedSurveyStopCollectingMessageWire {
  surveyorId: PublicKeyWire;
  nonce: number;
  ledgerNum: number;
}

/**
 * ```xdr
 * struct TimeSlicedSurveyStopCollectingMessage
 * {
 *     NodeID surveyorID;
 *     uint32 nonce;
 *     uint32 ledgerNum;
 * };
 * ```
 */
export class TimeSlicedSurveyStopCollectingMessage extends XdrValue {
  readonly surveyorId: PublicKey;
  readonly nonce: number;
  readonly ledgerNum: number;

  static readonly schema: XdrType<TimeSlicedSurveyStopCollectingMessageWire> =
    struct("TimeSlicedSurveyStopCollectingMessage", {
      surveyorId: PublicKey.schema,
      nonce: uint32(),
      ledgerNum: uint32(),
    });

  constructor(input: {
    surveyorId: PublicKey;
    nonce: number;
    ledgerNum: number;
  }) {
    super();
    this.surveyorId = input.surveyorId;
    this.nonce = input.nonce;
    this.ledgerNum = input.ledgerNum;
  }

  toXdrObject(): TimeSlicedSurveyStopCollectingMessageWire {
    return {
      surveyorId: this.surveyorId.toXdrObject(),
      nonce: this.nonce,
      ledgerNum: this.ledgerNum,
    };
  }

  static fromXdrObject(
    wire: TimeSlicedSurveyStopCollectingMessageWire,
  ): TimeSlicedSurveyStopCollectingMessage {
    return new TimeSlicedSurveyStopCollectingMessage({
      surveyorId: PublicKey.fromXdrObject(wire.surveyorId),
      nonce: wire.nonce,
      ledgerNum: wire.ledgerNum,
    });
  }
}
