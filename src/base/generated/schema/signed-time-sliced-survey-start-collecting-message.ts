// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Signature } from "./signature.js";
import { TimeSlicedSurveyStartCollectingMessage } from "./time-sliced-survey-start-collecting-message.js";
export interface SignedTimeSlicedSurveyStartCollectingMessage {
  readonly signature: Signature;
  readonly startCollecting: TimeSlicedSurveyStartCollectingMessage;
}
export const SignedTimeSlicedSurveyStartCollectingMessage = xdr.struct(
  "SignedTimeSlicedSurveyStartCollectingMessage",
  {
    signature: xdr.lazy(() => Signature),
    startCollecting: xdr.lazy(() => TimeSlicedSurveyStartCollectingMessage),
  },
) as xdr.XdrType<SignedTimeSlicedSurveyStartCollectingMessage>;
