// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Auth } from "./auth.js";
import { DontHave } from "./dont-have.js";
import { Error } from "./error.js";
import { FloodAdvert } from "./flood-advert.js";
import { FloodDemand } from "./flood-demand.js";
import { GeneralizedTransactionSet } from "./generalized-transaction-set.js";
import { Hello } from "./hello.js";
import { MessageType } from "./message-type.js";
import { PeerAddress } from "./peer-address.js";
import { SCPEnvelope } from "./scp-envelope.js";
import { SCPQuorumSet } from "./scp-quorum-set.js";
import { SendMore } from "./send-more.js";
import { SendMoreExtended } from "./send-more-extended.js";
import { SignedTimeSlicedSurveyRequestMessage } from "./signed-time-sliced-survey-request-message.js";
import { SignedTimeSlicedSurveyResponseMessage } from "./signed-time-sliced-survey-response-message.js";
import { SignedTimeSlicedSurveyStartCollectingMessage } from "./signed-time-sliced-survey-start-collecting-message.js";
import { SignedTimeSlicedSurveyStopCollectingMessage } from "./signed-time-sliced-survey-stop-collecting-message.js";
import { TransactionEnvelope } from "./transaction-envelope.js";
import { TransactionSet } from "./transaction-set.js";
import { uint256 } from "./uint256.js";
export type StellarMessage =
  | {
      readonly type: 0;
      readonly error: Error;
    }
  | {
      readonly type: 13;
      readonly hello: Hello;
    }
  | {
      readonly type: 2;
      readonly auth: Auth;
    }
  | {
      readonly type: 3;
      readonly dontHave: DontHave;
    }
  | {
      readonly type: 5;
      readonly peers: PeerAddress[];
    }
  | {
      readonly type: 6;
      readonly txSetHash: uint256;
    }
  | {
      readonly type: 7;
      readonly txSet: TransactionSet;
    }
  | {
      readonly type: 17;
      readonly generalizedTxSet: GeneralizedTransactionSet;
    }
  | {
      readonly type: 8;
      readonly transaction: TransactionEnvelope;
    }
  | {
      readonly type: 21;
      readonly signedTimeSlicedSurveyRequestMessage: SignedTimeSlicedSurveyRequestMessage;
    }
  | {
      readonly type: 22;
      readonly signedTimeSlicedSurveyResponseMessage: SignedTimeSlicedSurveyResponseMessage;
    }
  | {
      readonly type: 23;
      readonly signedTimeSlicedSurveyStartCollectingMessage: SignedTimeSlicedSurveyStartCollectingMessage;
    }
  | {
      readonly type: 24;
      readonly signedTimeSlicedSurveyStopCollectingMessage: SignedTimeSlicedSurveyStopCollectingMessage;
    }
  | {
      readonly type: 9;
      readonly qSetHash: uint256;
    }
  | {
      readonly type: 10;
      readonly qSet: SCPQuorumSet;
    }
  | {
      readonly type: 11;
      readonly envelope: SCPEnvelope;
    }
  | {
      readonly type: 12;
      readonly getSCPLedgerSeq: number;
    }
  | {
      readonly type: 16;
      readonly sendMoreMessage: SendMore;
    }
  | {
      readonly type: 20;
      readonly sendMoreExtendedMessage: SendMoreExtended;
    }
  | {
      readonly type: 18;
      readonly floodAdvert: FloodAdvert;
    }
  | {
      readonly type: 19;
      readonly floodDemand: FloodDemand;
    };
export const StellarMessage = xdr.union("StellarMessage", {
  switchOn: xdr.lazy(() => MessageType),
  switchKey: "type",
  cases: [
    xdr.case(
      "errorMsg",
      0,
      xdr.field(
        "error",
        xdr.lazy(() => Error),
      ),
    ),
    xdr.case(
      "hello",
      13,
      xdr.field(
        "hello",
        xdr.lazy(() => Hello),
      ),
    ),
    xdr.case(
      "auth",
      2,
      xdr.field(
        "auth",
        xdr.lazy(() => Auth),
      ),
    ),
    xdr.case(
      "dontHave",
      3,
      xdr.field(
        "dontHave",
        xdr.lazy(() => DontHave),
      ),
    ),
    xdr.case(
      "peers",
      5,
      xdr.field(
        "peers",
        xdr.array(
          xdr.lazy(() => PeerAddress),
          100,
        ),
      ),
    ),
    xdr.case(
      "getTxSet",
      6,
      xdr.field(
        "txSetHash",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "txSet",
      7,
      xdr.field(
        "txSet",
        xdr.lazy(() => TransactionSet),
      ),
    ),
    xdr.case(
      "generalizedTxSet",
      17,
      xdr.field(
        "generalizedTxSet",
        xdr.lazy(() => GeneralizedTransactionSet),
      ),
    ),
    xdr.case(
      "transaction",
      8,
      xdr.field(
        "transaction",
        xdr.lazy(() => TransactionEnvelope),
      ),
    ),
    xdr.case(
      "timeSlicedSurveyRequest",
      21,
      xdr.field(
        "signedTimeSlicedSurveyRequestMessage",
        xdr.lazy(() => SignedTimeSlicedSurveyRequestMessage),
      ),
    ),
    xdr.case(
      "timeSlicedSurveyResponse",
      22,
      xdr.field(
        "signedTimeSlicedSurveyResponseMessage",
        xdr.lazy(() => SignedTimeSlicedSurveyResponseMessage),
      ),
    ),
    xdr.case(
      "timeSlicedSurveyStartCollecting",
      23,
      xdr.field(
        "signedTimeSlicedSurveyStartCollectingMessage",
        xdr.lazy(() => SignedTimeSlicedSurveyStartCollectingMessage),
      ),
    ),
    xdr.case(
      "timeSlicedSurveyStopCollecting",
      24,
      xdr.field(
        "signedTimeSlicedSurveyStopCollectingMessage",
        xdr.lazy(() => SignedTimeSlicedSurveyStopCollectingMessage),
      ),
    ),
    xdr.case(
      "getScpQuorumset",
      9,
      xdr.field(
        "qSetHash",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "scpQuorumset",
      10,
      xdr.field(
        "qSet",
        xdr.lazy(() => SCPQuorumSet),
      ),
    ),
    xdr.case(
      "scpMessage",
      11,
      xdr.field(
        "envelope",
        xdr.lazy(() => SCPEnvelope),
      ),
    ),
    xdr.case("getScpState", 12, xdr.field("getSCPLedgerSeq", xdr.uint32())),
    xdr.case(
      "sendMore",
      16,
      xdr.field(
        "sendMoreMessage",
        xdr.lazy(() => SendMore),
      ),
    ),
    xdr.case(
      "sendMoreExtended",
      20,
      xdr.field(
        "sendMoreExtendedMessage",
        xdr.lazy(() => SendMoreExtended),
      ),
    ),
    xdr.case(
      "floodAdvert",
      18,
      xdr.field(
        "floodAdvert",
        xdr.lazy(() => FloodAdvert),
      ),
    ),
    xdr.case(
      "floodDemand",
      19,
      xdr.field(
        "floodDemand",
        xdr.lazy(() => FloodDemand),
      ),
    ),
  ] as const,
}) as xdr.XdrType<StellarMessage>;
