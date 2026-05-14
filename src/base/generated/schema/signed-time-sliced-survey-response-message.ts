// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Signature } from "./signature.js";
import { TimeSlicedSurveyResponseMessage } from "./time-sliced-survey-response-message.js";
export interface SignedTimeSlicedSurveyResponseMessage {
  readonly responseSignature: Signature;
  readonly response: TimeSlicedSurveyResponseMessage;
}
export const SignedTimeSlicedSurveyResponseMessage = xdr.struct(
  "SignedTimeSlicedSurveyResponseMessage",
  {
    responseSignature: xdr.lazy(() => Signature),
    response: xdr.lazy(() => TimeSlicedSurveyResponseMessage),
  },
) as xdr.XdrType<SignedTimeSlicedSurveyResponseMessage>;
