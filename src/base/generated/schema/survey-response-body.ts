// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SurveyMessageResponseType } from "./survey-message-response-type.js";
import { TopologyResponseBodyV2 } from "./topology-response-body-v2.js";
export type SurveyResponseBody = {
  readonly type: 2;
  readonly topologyResponseBodyV2: TopologyResponseBodyV2;
};
export const SurveyResponseBody = xdr.union("SurveyResponseBody", {
  switchOn: xdr.lazy(() => SurveyMessageResponseType),
  switchKey: "type",
  cases: [
    xdr.case(
      "surveyTopologyResponseV2",
      2,
      xdr.field(
        "topologyResponseBodyV2",
        xdr.lazy(() => TopologyResponseBodyV2),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SurveyResponseBody>;
