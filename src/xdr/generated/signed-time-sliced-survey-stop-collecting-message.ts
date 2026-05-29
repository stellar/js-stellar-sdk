import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Signature, type SignatureWire } from "./signature.js";
import {
  TimeSlicedSurveyStopCollectingMessage,
  type TimeSlicedSurveyStopCollectingMessageWire,
} from "./time-sliced-survey-stop-collecting-message.js";

export interface SignedTimeSlicedSurveyStopCollectingMessageWire {
  signature: SignatureWire;
  stopCollecting: TimeSlicedSurveyStopCollectingMessageWire;
}

/**
 * ```xdr
 * struct SignedTimeSlicedSurveyStopCollectingMessage
 * {
 *     Signature signature;
 *     TimeSlicedSurveyStopCollectingMessage stopCollecting;
 * };
 * ```
 */
export class SignedTimeSlicedSurveyStopCollectingMessage extends XdrValue {
  readonly signature: Signature;
  readonly stopCollecting: TimeSlicedSurveyStopCollectingMessage;

  static readonly schema: XdrType<SignedTimeSlicedSurveyStopCollectingMessageWire> =
    struct("SignedTimeSlicedSurveyStopCollectingMessage", {
      signature: Signature.schema,
      stopCollecting: TimeSlicedSurveyStopCollectingMessage.schema,
    });

  constructor(input: {
    signature: Signature | Uint8Array | string;
    stopCollecting: TimeSlicedSurveyStopCollectingMessage;
  }) {
    super();
    this.signature =
      input.signature instanceof Signature
        ? input.signature
        : new Signature(input.signature);
    this.stopCollecting = input.stopCollecting;
  }

  toXdrObject(): SignedTimeSlicedSurveyStopCollectingMessageWire {
    return {
      signature: this.signature.toXdrObject(),
      stopCollecting: this.stopCollecting.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SignedTimeSlicedSurveyStopCollectingMessageWire,
  ): SignedTimeSlicedSurveyStopCollectingMessage {
    return new SignedTimeSlicedSurveyStopCollectingMessage({
      signature: Signature.fromXdrObject(wire.signature),
      stopCollecting: TimeSlicedSurveyStopCollectingMessage.fromXdrObject(
        wire.stopCollecting,
      ),
    });
  }
}
