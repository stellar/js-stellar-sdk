// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Signature } from "./signature.js";
import { TimeSlicedSurveyRequestMessage } from "./time-sliced-survey-request-message.js";
export interface SignedTimeSlicedSurveyRequestMessage {
  readonly requestSignature: Signature;
  readonly request: TimeSlicedSurveyRequestMessage;
}
export const SignedTimeSlicedSurveyRequestMessage = xdr.struct(
  "SignedTimeSlicedSurveyRequestMessage",
  {
    requestSignature: xdr.lazy(() => Signature),
    request: xdr.lazy(() => TimeSlicedSurveyRequestMessage),
  },
) as xdr.XdrType<SignedTimeSlicedSurveyRequestMessage>;
