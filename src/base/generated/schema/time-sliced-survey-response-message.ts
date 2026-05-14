// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SurveyResponseMessage } from "./survey-response-message.js";
export interface TimeSlicedSurveyResponseMessage {
  readonly response: SurveyResponseMessage;
  readonly nonce: number;
}
export const TimeSlicedSurveyResponseMessage = xdr.struct(
  "TimeSlicedSurveyResponseMessage",
  {
    response: xdr.lazy(() => SurveyResponseMessage),
    nonce: xdr.uint32(),
  },
) as xdr.XdrType<TimeSlicedSurveyResponseMessage>;
