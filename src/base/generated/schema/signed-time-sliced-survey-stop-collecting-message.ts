// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Signature } from "./signature.js";
import { TimeSlicedSurveyStopCollectingMessage } from "./time-sliced-survey-stop-collecting-message.js";
export interface SignedTimeSlicedSurveyStopCollectingMessage {
  readonly signature: Signature;
  readonly stopCollecting: TimeSlicedSurveyStopCollectingMessage;
}
export const SignedTimeSlicedSurveyStopCollectingMessage = xdr.struct(
  "SignedTimeSlicedSurveyStopCollectingMessage",
  {
    signature: xdr.lazy(() => Signature),
    stopCollecting: xdr.lazy(() => TimeSlicedSurveyStopCollectingMessage),
  },
) as xdr.XdrType<SignedTimeSlicedSurveyStopCollectingMessage>;
