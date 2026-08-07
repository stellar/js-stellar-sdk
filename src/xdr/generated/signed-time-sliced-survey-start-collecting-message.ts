import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Signature, type SignatureWire } from "./signature.js";
import {
  TimeSlicedSurveyStartCollectingMessage,
  type TimeSlicedSurveyStartCollectingMessageWire,
} from "./time-sliced-survey-start-collecting-message.js";

export interface SignedTimeSlicedSurveyStartCollectingMessageWire {
  signature: SignatureWire;
  startCollecting: TimeSlicedSurveyStartCollectingMessageWire;
}

/**
 * ```xdr
 * struct SignedTimeSlicedSurveyStartCollectingMessage
 * {
 *     Signature signature;
 *     TimeSlicedSurveyStartCollectingMessage startCollecting;
 * };
 * ```
 */
export class SignedTimeSlicedSurveyStartCollectingMessage extends XdrValue {
  readonly signature: Signature;
  readonly startCollecting: TimeSlicedSurveyStartCollectingMessage;

  static readonly schema: XdrType<SignedTimeSlicedSurveyStartCollectingMessageWire> =
    struct("SignedTimeSlicedSurveyStartCollectingMessage", {
      signature: Signature.schema,
      startCollecting: TimeSlicedSurveyStartCollectingMessage.schema,
    });

  constructor(input: {
    signature: Signature | Uint8Array | string;
    startCollecting: TimeSlicedSurveyStartCollectingMessage;
  }) {
    super();
    this.signature =
      input.signature instanceof Signature
        ? input.signature
        : new Signature(input.signature);
    this.startCollecting = input.startCollecting;
  }

  toXdrObject(): SignedTimeSlicedSurveyStartCollectingMessageWire {
    return {
      signature: this.signature.toXdrObject(),
      startCollecting: this.startCollecting.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SignedTimeSlicedSurveyStartCollectingMessageWire,
  ): SignedTimeSlicedSurveyStartCollectingMessage {
    return new SignedTimeSlicedSurveyStartCollectingMessage({
      signature: Signature.fromXdrObject(wire.signature),
      startCollecting: TimeSlicedSurveyStartCollectingMessage.fromXdrObject(
        wire.startCollecting,
      ),
    });
  }
}
