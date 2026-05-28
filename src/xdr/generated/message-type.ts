import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type MessageTypeWire = number;

export type MessageTypeName =
  | "errorMsg"
  | "auth"
  | "dontHave"
  | "peers"
  | "getTxSet"
  | "txSet"
  | "generalizedTxSet"
  | "transaction"
  | "getScpQuorumset"
  | "scpQuorumset"
  | "scpMessage"
  | "getScpState"
  | "hello"
  | "sendMore"
  | "sendMoreExtended"
  | "floodAdvert"
  | "floodDemand"
  | "timeSlicedSurveyRequest"
  | "timeSlicedSurveyResponse"
  | "timeSlicedSurveyStartCollecting"
  | "timeSlicedSurveyStopCollecting";

/**
 * ```xdr
 * enum MessageType
 * {
 *     ERROR_MSG = 0,
 *     AUTH = 2,
 *     DONT_HAVE = 3,
 *     // GET_PEERS (4) is deprecated
 *
 *     PEERS = 5,
 *
 *     GET_TX_SET = 6, // gets a particular txset by hash
 *     TX_SET = 7,
 *     GENERALIZED_TX_SET = 17,
 *
 *     TRANSACTION = 8, // pass on a tx you have heard about
 *
 *     // SCP
 *     GET_SCP_QUORUMSET = 9,
 *     SCP_QUORUMSET = 10,
 *     SCP_MESSAGE = 11,
 *     GET_SCP_STATE = 12,
 *
 *     // new messages
 *     HELLO = 13,
 *
 *     // SURVEY_REQUEST (14) removed and replaced by TIME_SLICED_SURVEY_REQUEST
 *     // SURVEY_RESPONSE (15) removed and replaced by TIME_SLICED_SURVEY_RESPONSE
 *
 *     SEND_MORE = 16,
 *     SEND_MORE_EXTENDED = 20,
 *
 *     FLOOD_ADVERT = 18,
 *     FLOOD_DEMAND = 19,
 *
 *     TIME_SLICED_SURVEY_REQUEST = 21,
 *     TIME_SLICED_SURVEY_RESPONSE = 22,
 *     TIME_SLICED_SURVEY_START_COLLECTING = 23,
 *     TIME_SLICED_SURVEY_STOP_COLLECTING = 24
 * };
 * ```
 */
export class MessageType extends EnumValue<MessageTypeName> {
  static readonly errorMsg = new MessageType("errorMsg", 0);
  static readonly auth = new MessageType("auth", 2);
  static readonly dontHave = new MessageType("dontHave", 3);
  static readonly peers = new MessageType("peers", 5);
  static readonly getTxSet = new MessageType("getTxSet", 6);
  static readonly txSet = new MessageType("txSet", 7);
  static readonly generalizedTxSet = new MessageType("generalizedTxSet", 17);
  static readonly transaction = new MessageType("transaction", 8);
  static readonly getScpQuorumset = new MessageType("getScpQuorumset", 9);
  static readonly scpQuorumset = new MessageType("scpQuorumset", 10);
  static readonly scpMessage = new MessageType("scpMessage", 11);
  static readonly getScpState = new MessageType("getScpState", 12);
  static readonly hello = new MessageType("hello", 13);
  static readonly sendMore = new MessageType("sendMore", 16);
  static readonly sendMoreExtended = new MessageType("sendMoreExtended", 20);
  static readonly floodAdvert = new MessageType("floodAdvert", 18);
  static readonly floodDemand = new MessageType("floodDemand", 19);
  static readonly timeSlicedSurveyRequest = new MessageType(
    "timeSlicedSurveyRequest",
    21,
  );
  static readonly timeSlicedSurveyResponse = new MessageType(
    "timeSlicedSurveyResponse",
    22,
  );
  static readonly timeSlicedSurveyStartCollecting = new MessageType(
    "timeSlicedSurveyStartCollecting",
    23,
  );
  static readonly timeSlicedSurveyStopCollecting = new MessageType(
    "timeSlicedSurveyStopCollecting",
    24,
  );

  static readonly schema = enumType("MessageType", {
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
  });

  static fromValue(value: number): MessageType {
    return enumFromValue("MessageType", MessageType.schema, MessageType, value);
  }

  static fromName(name: MessageTypeName): MessageType {
    return enumFromName("MessageType", MessageType, name);
  }

  static fromXdrObject(wire: number): MessageType {
    return MessageType.fromValue(wire);
  }
}
