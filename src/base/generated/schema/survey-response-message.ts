// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EncryptedBody } from "./encrypted-body.js";
import { NodeId } from "./node-id.js";
import { SurveyMessageCommandType } from "./survey-message-command-type.js";
export interface SurveyResponseMessage {
  readonly surveyorPeerId: NodeId;
  readonly surveyedPeerId: NodeId;
  readonly ledgerNum: number;
  readonly commandType: SurveyMessageCommandType;
  readonly encryptedBody: EncryptedBody;
}
export const SurveyResponseMessage = xdr.struct("SurveyResponseMessage", {
  surveyorPeerId: xdr.lazy(() => NodeId),
  surveyedPeerId: xdr.lazy(() => NodeId),
  ledgerNum: xdr.uint32(),
  commandType: xdr.lazy(() => SurveyMessageCommandType),
  encryptedBody: xdr.lazy(() => EncryptedBody),
}) as xdr.XdrType<SurveyResponseMessage>;
