// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Curve25519Public } from "./curve25519-public.js";
import { NodeId } from "./node-id.js";
import { SurveyMessageCommandType } from "./survey-message-command-type.js";
export interface SurveyRequestMessage {
  readonly surveyorPeerId: NodeId;
  readonly surveyedPeerId: NodeId;
  readonly ledgerNum: number;
  readonly encryptionKey: Curve25519Public;
  readonly commandType: SurveyMessageCommandType;
}
export const SurveyRequestMessage = xdr.struct("SurveyRequestMessage", {
  surveyorPeerId: xdr.lazy(() => NodeId),
  surveyedPeerId: xdr.lazy(() => NodeId),
  ledgerNum: xdr.uint32(),
  encryptionKey: xdr.lazy(() => Curve25519Public),
  commandType: xdr.lazy(() => SurveyMessageCommandType),
}) as xdr.XdrType<SurveyRequestMessage>;
