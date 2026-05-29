import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  SurveyResponseMessage,
  type SurveyResponseMessageWire,
} from "./survey-response-message.js";

export interface TimeSlicedSurveyResponseMessageWire {
  response: SurveyResponseMessageWire;
  nonce: number;
}

/**
 * ```xdr
 * struct TimeSlicedSurveyResponseMessage
 * {
 *     SurveyResponseMessage response;
 *     uint32 nonce;
 * };
 * ```
 */
export class TimeSlicedSurveyResponseMessage extends XdrValue {
  readonly response: SurveyResponseMessage;
  readonly nonce: number;

  static readonly schema: XdrType<TimeSlicedSurveyResponseMessageWire> = struct(
    "TimeSlicedSurveyResponseMessage",
    {
      response: SurveyResponseMessage.schema,
      nonce: uint32(),
    },
  );

  constructor(input: { response: SurveyResponseMessage; nonce: number }) {
    super();
    this.response = input.response;
    this.nonce = input.nonce;
  }

  toXdrObject(): TimeSlicedSurveyResponseMessageWire {
    return {
      response: this.response.toXdrObject(),
      nonce: this.nonce,
    };
  }

  static fromXdrObject(
    wire: TimeSlicedSurveyResponseMessageWire,
  ): TimeSlicedSurveyResponseMessage {
    return new TimeSlicedSurveyResponseMessage({
      response: SurveyResponseMessage.fromXdrObject(wire.response),
      nonce: wire.nonce,
    });
  }
}
