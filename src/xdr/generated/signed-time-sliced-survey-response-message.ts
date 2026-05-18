import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Signature, type SignatureWire } from "./signature.js";
import {
  TimeSlicedSurveyResponseMessage,
  type TimeSlicedSurveyResponseMessageWire,
} from "./time-sliced-survey-response-message.js";

export interface SignedTimeSlicedSurveyResponseMessageWire {
  responseSignature: SignatureWire;
  response: TimeSlicedSurveyResponseMessageWire;
}

/**
 * ```xdr
 * struct SignedTimeSlicedSurveyResponseMessage
 * {
 *     Signature responseSignature;
 *     TimeSlicedSurveyResponseMessage response;
 * };
 * ```
 */
export class SignedTimeSlicedSurveyResponseMessage extends XdrValue {
  readonly responseSignature: Signature;
  readonly response: TimeSlicedSurveyResponseMessage;

  static readonly schema: XdrType<SignedTimeSlicedSurveyResponseMessageWire> =
    struct("SignedTimeSlicedSurveyResponseMessage", {
      responseSignature: Signature.schema,
      response: TimeSlicedSurveyResponseMessage.schema,
    });

  constructor(input: {
    responseSignature: Signature | Uint8Array | string;
    response: TimeSlicedSurveyResponseMessage;
  }) {
    super();
    this.responseSignature =
      input.responseSignature instanceof Signature
        ? input.responseSignature
        : new Signature(input.responseSignature);
    this.response = input.response;
  }

  toXdrObject(): SignedTimeSlicedSurveyResponseMessageWire {
    return {
      responseSignature: this.responseSignature.toXdrObject(),
      response: this.response.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SignedTimeSlicedSurveyResponseMessageWire,
  ): SignedTimeSlicedSurveyResponseMessage {
    return new SignedTimeSlicedSurveyResponseMessage({
      responseSignature: Signature.fromXdrObject(wire.responseSignature),
      response: TimeSlicedSurveyResponseMessage.fromXdrObject(wire.response),
    });
  }
}
