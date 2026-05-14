// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { NodeId } from "./node-id.js";
export interface TimeSlicedSurveyStopCollectingMessage {
  readonly surveyorId: NodeId;
  readonly nonce: number;
  readonly ledgerNum: number;
}
export const TimeSlicedSurveyStopCollectingMessage = xdr.struct(
  "TimeSlicedSurveyStopCollectingMessage",
  {
    surveyorId: xdr.lazy(() => NodeId),
    nonce: xdr.uint32(),
    ledgerNum: xdr.uint32(),
  },
) as xdr.XdrType<TimeSlicedSurveyStopCollectingMessage>;
