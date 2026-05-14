// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SurveyRequestMessage } from "./survey-request-message.js";
export interface TimeSlicedSurveyRequestMessage {
  readonly request: SurveyRequestMessage;
  readonly nonce: number;
  readonly inboundPeersIndex: number;
  readonly outboundPeersIndex: number;
}
export const TimeSlicedSurveyRequestMessage = xdr.struct(
  "TimeSlicedSurveyRequestMessage",
  {
    request: xdr.lazy(() => SurveyRequestMessage),
    nonce: xdr.uint32(),
    inboundPeersIndex: xdr.uint32(),
    outboundPeersIndex: xdr.uint32(),
  },
) as xdr.XdrType<TimeSlicedSurveyRequestMessage>;
