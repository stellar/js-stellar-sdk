import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Signature, type SignatureWire } from "./signature.js";
import {
  TimeSlicedSurveyRequestMessage,
  type TimeSlicedSurveyRequestMessageWire,
} from "./time-sliced-survey-request-message.js";

export interface SignedTimeSlicedSurveyRequestMessageWire {
  requestSignature: SignatureWire;
  request: TimeSlicedSurveyRequestMessageWire;
}

/**
 * ```xdr
 * struct SignedTimeSlicedSurveyRequestMessage
 * {
 *     Signature requestSignature;
 *     TimeSlicedSurveyRequestMessage request;
 * };
 * ```
 */
export class SignedTimeSlicedSurveyRequestMessage extends XdrValue {
  readonly requestSignature: Signature;
  readonly request: TimeSlicedSurveyRequestMessage;

  static readonly schema: XdrType<SignedTimeSlicedSurveyRequestMessageWire> =
    struct("SignedTimeSlicedSurveyRequestMessage", {
      requestSignature: Signature.schema,
      request: TimeSlicedSurveyRequestMessage.schema,
    });

  constructor(input: {
    requestSignature: Signature | Uint8Array | string;
    request: TimeSlicedSurveyRequestMessage;
  }) {
    super();
    this.requestSignature =
      input.requestSignature instanceof Signature
        ? input.requestSignature
        : new Signature(input.requestSignature);
    this.request = input.request;
  }

  toXdrObject(): SignedTimeSlicedSurveyRequestMessageWire {
    return {
      requestSignature: this.requestSignature.toXdrObject(),
      request: this.request.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SignedTimeSlicedSurveyRequestMessageWire,
  ): SignedTimeSlicedSurveyRequestMessage {
    return new SignedTimeSlicedSurveyRequestMessage({
      requestSignature: Signature.fromXdrObject(wire.requestSignature),
      request: TimeSlicedSurveyRequestMessage.fromXdrObject(wire.request),
    });
  }
}
