// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const MessageType = xdr.enumType("MessageType", {
  errorMsg: 0,
  auth: 2,
  dontHave: 3,
  peers: 5,
  getTxSet: 6,
  txSet: 7,
  generalizedTxSet: 17,
  transaction: 8,
  getScpQuorumset: 9,
  scpQuorumset: 10,
  scpMessage: 11,
  getScpState: 12,
  hello: 13,
  sendMore: 16,
  sendMoreExtended: 20,
  floodAdvert: 18,
  floodDemand: 19,
  timeSlicedSurveyRequest: 21,
  timeSlicedSurveyResponse: 22,
  timeSlicedSurveyStartCollecting: 23,
  timeSlicedSurveyStopCollecting: 24,
} as const);
export type MessageType = xdr.Infer<typeof MessageType>;
