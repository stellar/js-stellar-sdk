/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { array } from "../types/array.js";
import { opaque } from "../types/opaque.js";
import { uint32 } from "../types/uint32.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { MessageType } from "./message-type.js";
import { Error, type ErrorWire } from "./error.js";
import { Hello, type HelloWire } from "./hello.js";
import { Auth, type AuthWire } from "./auth.js";
import { DontHave, type DontHaveWire } from "./dont-have.js";
import { PeerAddress, type PeerAddressWire } from "./peer-address.js";
import { TransactionSet, type TransactionSetWire } from "./transaction-set.js";
import {
  GeneralizedTransactionSet,
  type GeneralizedTransactionSetWire,
} from "./generalized-transaction-set.js";
import {
  TransactionEnvelope,
  type TransactionEnvelopeWire,
} from "./transaction-envelope.js";
import {
  SignedTimeSlicedSurveyRequestMessage,
  type SignedTimeSlicedSurveyRequestMessageWire,
} from "./signed-time-sliced-survey-request-message.js";
import {
  SignedTimeSlicedSurveyResponseMessage,
  type SignedTimeSlicedSurveyResponseMessageWire,
} from "./signed-time-sliced-survey-response-message.js";
import {
  SignedTimeSlicedSurveyStartCollectingMessage,
  type SignedTimeSlicedSurveyStartCollectingMessageWire,
} from "./signed-time-sliced-survey-start-collecting-message.js";
import {
  SignedTimeSlicedSurveyStopCollectingMessage,
  type SignedTimeSlicedSurveyStopCollectingMessageWire,
} from "./signed-time-sliced-survey-stop-collecting-message.js";
import { ScpQuorumSet, type ScpQuorumSetWire } from "./scp-quorum-set.js";
import { ScpEnvelope, type ScpEnvelopeWire } from "./scp-envelope.js";
import { SendMore, type SendMoreWire } from "./send-more.js";
import {
  SendMoreExtended,
  type SendMoreExtendedWire,
} from "./send-more-extended.js";
import { FloodAdvert, type FloodAdvertWire } from "./flood-advert.js";
import { FloodDemand, type FloodDemandWire } from "./flood-demand.js";

export type StellarMessageWire =
  | { type: 0; error: ErrorWire }
  | { type: 13; hello: HelloWire }
  | { type: 2; auth: AuthWire }
  | { type: 3; dontHave: DontHaveWire }
  | { type: 5; peers: PeerAddressWire[] }
  | { type: 6; txSetHash: Uint8Array }
  | { type: 7; txSet: TransactionSetWire }
  | { type: 17; generalizedTxSet: GeneralizedTransactionSetWire }
  | { type: 8; transaction: TransactionEnvelopeWire }
  | {
      type: 21;
      signedTimeSlicedSurveyRequestMessage: SignedTimeSlicedSurveyRequestMessageWire;
    }
  | {
      type: 22;
      signedTimeSlicedSurveyResponseMessage: SignedTimeSlicedSurveyResponseMessageWire;
    }
  | {
      type: 23;
      signedTimeSlicedSurveyStartCollectingMessage: SignedTimeSlicedSurveyStartCollectingMessageWire;
    }
  | {
      type: 24;
      signedTimeSlicedSurveyStopCollectingMessage: SignedTimeSlicedSurveyStopCollectingMessageWire;
    }
  | { type: 9; qSetHash: Uint8Array }
  | { type: 10; qSet: ScpQuorumSetWire }
  | { type: 11; envelope: ScpEnvelopeWire }
  | { type: 12; getScpLedgerSeq: number }
  | { type: 16; sendMoreMessage: SendMoreWire }
  | { type: 20; sendMoreExtendedMessage: SendMoreExtendedWire }
  | { type: 18; floodAdvert: FloodAdvertWire }
  | { type: 19; floodDemand: FloodDemandWire };

export type StellarMessageVariantName =
  | "errorMsg"
  | "hello"
  | "auth"
  | "dontHave"
  | "peers"
  | "getTxSet"
  | "txSet"
  | "generalizedTxSet"
  | "transaction"
  | "timeSlicedSurveyRequest"
  | "timeSlicedSurveyResponse"
  | "timeSlicedSurveyStartCollecting"
  | "timeSlicedSurveyStopCollecting"
  | "getScpQuorumset"
  | "scpQuorumset"
  | "scpMessage"
  | "getScpState"
  | "sendMore"
  | "sendMoreExtended"
  | "floodAdvert"
  | "floodDemand";

/**
 * ```xdr
 * union StellarMessage switch (MessageType type)
 * {
 * case ERROR_MSG:
 *     Error error;
 * case HELLO:
 *     Hello hello;
 * case AUTH:
 *     Auth auth;
 * case DONT_HAVE:
 *     DontHave dontHave;
 * case PEERS:
 *     PeerAddress peers<100>;
 *
 * case GET_TX_SET:
 *     uint256 txSetHash;
 * case TX_SET:
 *     TransactionSet txSet;
 * case GENERALIZED_TX_SET:
 *     GeneralizedTransactionSet generalizedTxSet;
 *
 * case TRANSACTION:
 *     TransactionEnvelope transaction;
 *
 * case TIME_SLICED_SURVEY_REQUEST:
 *     SignedTimeSlicedSurveyRequestMessage signedTimeSlicedSurveyRequestMessage;
 *
 * case TIME_SLICED_SURVEY_RESPONSE:
 *     SignedTimeSlicedSurveyResponseMessage signedTimeSlicedSurveyResponseMessage;
 *
 * case TIME_SLICED_SURVEY_START_COLLECTING:
 *     SignedTimeSlicedSurveyStartCollectingMessage
 *         signedTimeSlicedSurveyStartCollectingMessage;
 *
 * case TIME_SLICED_SURVEY_STOP_COLLECTING:
 *     SignedTimeSlicedSurveyStopCollectingMessage
 *         signedTimeSlicedSurveyStopCollectingMessage;
 *
 * // SCP
 * case GET_SCP_QUORUMSET:
 *     uint256 qSetHash;
 * case SCP_QUORUMSET:
 *     SCPQuorumSet qSet;
 * case SCP_MESSAGE:
 *     SCPEnvelope envelope;
 * case GET_SCP_STATE:
 *     uint32 getSCPLedgerSeq; // ledger seq requested ; if 0, requests the latest
 * case SEND_MORE:
 *     SendMore sendMoreMessage;
 * case SEND_MORE_EXTENDED:
 *     SendMoreExtended sendMoreExtendedMessage;
 * // Pull mode
 * case FLOOD_ADVERT:
 *      FloodAdvert floodAdvert;
 * case FLOOD_DEMAND:
 *      FloodDemand floodDemand;
 * };
 * ```
 */
abstract class StellarMessageBase extends XdrValue {
  abstract readonly type: StellarMessageVariantName;

  static readonly schema: XdrType<StellarMessageWire> = union(
    "StellarMessage",
    {
      switchOn: MessageType.schema,
      cases: [
        case_("errorMsg", 0, field("error", Error.schema)),
        case_("hello", 13, field("hello", Hello.schema)),
        case_("auth", 2, field("auth", Auth.schema)),
        case_("dontHave", 3, field("dontHave", DontHave.schema)),
        case_(
          "peers",
          5,
          field("peers", array(PeerAddress.schema, UNBOUNDED_MAX_LENGTH)),
        ),
        case_("getTxSet", 6, field("txSetHash", opaque(32))),
        case_("txSet", 7, field("txSet", TransactionSet.schema)),
        case_(
          "generalizedTxSet",
          17,
          field("generalizedTxSet", GeneralizedTransactionSet.schema),
        ),
        case_(
          "transaction",
          8,
          field("transaction", TransactionEnvelope.schema),
        ),
        case_(
          "timeSlicedSurveyRequest",
          21,
          field(
            "signedTimeSlicedSurveyRequestMessage",
            SignedTimeSlicedSurveyRequestMessage.schema,
          ),
        ),
        case_(
          "timeSlicedSurveyResponse",
          22,
          field(
            "signedTimeSlicedSurveyResponseMessage",
            SignedTimeSlicedSurveyResponseMessage.schema,
          ),
        ),
        case_(
          "timeSlicedSurveyStartCollecting",
          23,
          field(
            "signedTimeSlicedSurveyStartCollectingMessage",
            SignedTimeSlicedSurveyStartCollectingMessage.schema,
          ),
        ),
        case_(
          "timeSlicedSurveyStopCollecting",
          24,
          field(
            "signedTimeSlicedSurveyStopCollectingMessage",
            SignedTimeSlicedSurveyStopCollectingMessage.schema,
          ),
        ),
        case_("getScpQuorumset", 9, field("qSetHash", opaque(32))),
        case_("scpQuorumset", 10, field("qSet", ScpQuorumSet.schema)),
        case_("scpMessage", 11, field("envelope", ScpEnvelope.schema)),
        case_("getScpState", 12, field("getScpLedgerSeq", uint32())),
        case_("sendMore", 16, field("sendMoreMessage", SendMore.schema)),
        case_(
          "sendMoreExtended",
          20,
          field("sendMoreExtendedMessage", SendMoreExtended.schema),
        ),
        case_("floodAdvert", 18, field("floodAdvert", FloodAdvert.schema)),
        case_("floodDemand", 19, field("floodDemand", FloodDemand.schema)),
      ],
    },
  );

  static errorMsg(error: Error): StellarMessageErrorMsg {
    return new StellarMessageErrorMsg(error);
  }

  static hello(hello: Hello): StellarMessageHello {
    return new StellarMessageHello(hello);
  }

  static auth(auth: Auth): StellarMessageAuth {
    return new StellarMessageAuth(auth);
  }

  static dontHave(dontHave: DontHave): StellarMessageDontHave {
    return new StellarMessageDontHave(dontHave);
  }

  static peers(peers: PeerAddress[]): StellarMessagePeers {
    return new StellarMessagePeers(peers);
  }

  static getTxSet(txSetHash: Uint8Array): StellarMessageGetTxSet {
    return new StellarMessageGetTxSet(txSetHash);
  }

  static txSet(txSet: TransactionSet): StellarMessageTxSet {
    return new StellarMessageTxSet(txSet);
  }

  static generalizedTxSet(
    generalizedTxSet: GeneralizedTransactionSet,
  ): StellarMessageGeneralizedTxSet {
    return new StellarMessageGeneralizedTxSet(generalizedTxSet);
  }

  static transaction(
    transaction: TransactionEnvelope,
  ): StellarMessageTransaction {
    return new StellarMessageTransaction(transaction);
  }

  static timeSlicedSurveyRequest(
    signedTimeSlicedSurveyRequestMessage: SignedTimeSlicedSurveyRequestMessage,
  ): StellarMessageTimeSlicedSurveyRequest {
    return new StellarMessageTimeSlicedSurveyRequest(
      signedTimeSlicedSurveyRequestMessage,
    );
  }

  static timeSlicedSurveyResponse(
    signedTimeSlicedSurveyResponseMessage: SignedTimeSlicedSurveyResponseMessage,
  ): StellarMessageTimeSlicedSurveyResponse {
    return new StellarMessageTimeSlicedSurveyResponse(
      signedTimeSlicedSurveyResponseMessage,
    );
  }

  static timeSlicedSurveyStartCollecting(
    signedTimeSlicedSurveyStartCollectingMessage: SignedTimeSlicedSurveyStartCollectingMessage,
  ): StellarMessageTimeSlicedSurveyStartCollecting {
    return new StellarMessageTimeSlicedSurveyStartCollecting(
      signedTimeSlicedSurveyStartCollectingMessage,
    );
  }

  static timeSlicedSurveyStopCollecting(
    signedTimeSlicedSurveyStopCollectingMessage: SignedTimeSlicedSurveyStopCollectingMessage,
  ): StellarMessageTimeSlicedSurveyStopCollecting {
    return new StellarMessageTimeSlicedSurveyStopCollecting(
      signedTimeSlicedSurveyStopCollectingMessage,
    );
  }

  static getScpQuorumset(qSetHash: Uint8Array): StellarMessageGetScpQuorumset {
    return new StellarMessageGetScpQuorumset(qSetHash);
  }

  static scpQuorumset(qSet: ScpQuorumSet): StellarMessageScpQuorumset {
    return new StellarMessageScpQuorumset(qSet);
  }

  static scpMessage(envelope: ScpEnvelope): StellarMessageScpMessage {
    return new StellarMessageScpMessage(envelope);
  }

  static getScpState(getScpLedgerSeq: number): StellarMessageGetScpState {
    return new StellarMessageGetScpState(getScpLedgerSeq);
  }

  static sendMore(sendMoreMessage: SendMore): StellarMessageSendMore {
    return new StellarMessageSendMore(sendMoreMessage);
  }

  static sendMoreExtended(
    sendMoreExtendedMessage: SendMoreExtended,
  ): StellarMessageSendMoreExtended {
    return new StellarMessageSendMoreExtended(sendMoreExtendedMessage);
  }

  static floodAdvert(floodAdvert: FloodAdvert): StellarMessageFloodAdvert {
    return new StellarMessageFloodAdvert(floodAdvert);
  }

  static floodDemand(floodDemand: FloodDemand): StellarMessageFloodDemand {
    return new StellarMessageFloodDemand(floodDemand);
  }

  static fromXdrObject(wire: StellarMessageWire): StellarMessage {
    switch (wire.type) {
      case 0:
        return new StellarMessageErrorMsg(Error.fromXdrObject(wire.error));
      case 13:
        return new StellarMessageHello(Hello.fromXdrObject(wire.hello));
      case 2:
        return new StellarMessageAuth(Auth.fromXdrObject(wire.auth));
      case 3:
        return new StellarMessageDontHave(
          DontHave.fromXdrObject(wire.dontHave),
        );
      case 5:
        return new StellarMessagePeers(
          wire.peers.map((w) => PeerAddress.fromXdrObject(w)),
        );
      case 6:
        return new StellarMessageGetTxSet(wire.txSetHash);
      case 7:
        return new StellarMessageTxSet(
          TransactionSet.fromXdrObject(wire.txSet),
        );
      case 17:
        return new StellarMessageGeneralizedTxSet(
          GeneralizedTransactionSet.fromXdrObject(wire.generalizedTxSet),
        );
      case 8:
        return new StellarMessageTransaction(
          TransactionEnvelope.fromXdrObject(wire.transaction),
        );
      case 21:
        return new StellarMessageTimeSlicedSurveyRequest(
          SignedTimeSlicedSurveyRequestMessage.fromXdrObject(
            wire.signedTimeSlicedSurveyRequestMessage,
          ),
        );
      case 22:
        return new StellarMessageTimeSlicedSurveyResponse(
          SignedTimeSlicedSurveyResponseMessage.fromXdrObject(
            wire.signedTimeSlicedSurveyResponseMessage,
          ),
        );
      case 23:
        return new StellarMessageTimeSlicedSurveyStartCollecting(
          SignedTimeSlicedSurveyStartCollectingMessage.fromXdrObject(
            wire.signedTimeSlicedSurveyStartCollectingMessage,
          ),
        );
      case 24:
        return new StellarMessageTimeSlicedSurveyStopCollecting(
          SignedTimeSlicedSurveyStopCollectingMessage.fromXdrObject(
            wire.signedTimeSlicedSurveyStopCollectingMessage,
          ),
        );
      case 9:
        return new StellarMessageGetScpQuorumset(wire.qSetHash);
      case 10:
        return new StellarMessageScpQuorumset(
          ScpQuorumSet.fromXdrObject(wire.qSet),
        );
      case 11:
        return new StellarMessageScpMessage(
          ScpEnvelope.fromXdrObject(wire.envelope),
        );
      case 12:
        return new StellarMessageGetScpState(wire.getScpLedgerSeq);
      case 16:
        return new StellarMessageSendMore(
          SendMore.fromXdrObject(wire.sendMoreMessage),
        );
      case 20:
        return new StellarMessageSendMoreExtended(
          SendMoreExtended.fromXdrObject(wire.sendMoreExtendedMessage),
        );
      case 18:
        return new StellarMessageFloodAdvert(
          FloodAdvert.fromXdrObject(wire.floodAdvert),
        );
      case 19:
        return new StellarMessageFloodDemand(
          FloodDemand.fromXdrObject(wire.floodDemand),
        );
    }
  }

  abstract toXdrObject(): StellarMessageWire;
}

export class StellarMessageErrorMsg extends StellarMessageBase {
  readonly type = "errorMsg" as const;
  readonly error: Error;

  constructor(error: Error) {
    super();
    this.error = error;
  }

  get value(): Error {
    return this.error;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 0 }> {
    return { type: 0, error: this.error.toXdrObject() };
  }
}

export class StellarMessageHello extends StellarMessageBase {
  readonly type = "hello" as const;
  readonly hello: Hello;

  constructor(hello: Hello) {
    super();
    this.hello = hello;
  }

  get value(): Hello {
    return this.hello;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 13 }> {
    return { type: 13, hello: this.hello.toXdrObject() };
  }
}

export class StellarMessageAuth extends StellarMessageBase {
  readonly type = "auth" as const;
  readonly auth: Auth;

  constructor(auth: Auth) {
    super();
    this.auth = auth;
  }

  get value(): Auth {
    return this.auth;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 2 }> {
    return { type: 2, auth: this.auth.toXdrObject() };
  }
}

export class StellarMessageDontHave extends StellarMessageBase {
  readonly type = "dontHave" as const;
  readonly dontHave: DontHave;

  constructor(dontHave: DontHave) {
    super();
    this.dontHave = dontHave;
  }

  get value(): DontHave {
    return this.dontHave;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 3 }> {
    return { type: 3, dontHave: this.dontHave.toXdrObject() };
  }
}

export class StellarMessagePeers extends StellarMessageBase {
  readonly type = "peers" as const;
  readonly peers: PeerAddress[];

  constructor(peers: PeerAddress[]) {
    super();
    this.peers = peers;
  }

  get value(): PeerAddress[] {
    return this.peers;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 5 }> {
    return { type: 5, peers: this.peers.map((v) => v.toXdrObject()) };
  }
}

export class StellarMessageGetTxSet extends StellarMessageBase {
  readonly type = "getTxSet" as const;
  readonly txSetHash: Uint8Array;

  constructor(txSetHash: Uint8Array) {
    super();
    this.txSetHash = txSetHash;
  }

  get value(): Uint8Array {
    return this.txSetHash;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 6 }> {
    return { type: 6, txSetHash: this.txSetHash };
  }
}

export class StellarMessageTxSet extends StellarMessageBase {
  readonly type = "txSet" as const;
  readonly txSet: TransactionSet;

  constructor(txSet: TransactionSet) {
    super();
    this.txSet = txSet;
  }

  get value(): TransactionSet {
    return this.txSet;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 7 }> {
    return { type: 7, txSet: this.txSet.toXdrObject() };
  }
}

export class StellarMessageGeneralizedTxSet extends StellarMessageBase {
  readonly type = "generalizedTxSet" as const;
  readonly generalizedTxSet: GeneralizedTransactionSet;

  constructor(generalizedTxSet: GeneralizedTransactionSet) {
    super();
    this.generalizedTxSet = generalizedTxSet;
  }

  get value(): GeneralizedTransactionSet {
    return this.generalizedTxSet;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 17 }> {
    return { type: 17, generalizedTxSet: this.generalizedTxSet.toXdrObject() };
  }
}

export class StellarMessageTransaction extends StellarMessageBase {
  readonly type = "transaction" as const;
  readonly transaction: TransactionEnvelope;

  constructor(transaction: TransactionEnvelope) {
    super();
    this.transaction = transaction;
  }

  get value(): TransactionEnvelope {
    return this.transaction;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 8 }> {
    return { type: 8, transaction: this.transaction.toXdrObject() };
  }
}

export class StellarMessageTimeSlicedSurveyRequest extends StellarMessageBase {
  readonly type = "timeSlicedSurveyRequest" as const;
  readonly signedTimeSlicedSurveyRequestMessage: SignedTimeSlicedSurveyRequestMessage;

  constructor(
    signedTimeSlicedSurveyRequestMessage: SignedTimeSlicedSurveyRequestMessage,
  ) {
    super();
    this.signedTimeSlicedSurveyRequestMessage =
      signedTimeSlicedSurveyRequestMessage;
  }

  get value(): SignedTimeSlicedSurveyRequestMessage {
    return this.signedTimeSlicedSurveyRequestMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 21 }> {
    return {
      type: 21,
      signedTimeSlicedSurveyRequestMessage:
        this.signedTimeSlicedSurveyRequestMessage.toXdrObject(),
    };
  }
}

export class StellarMessageTimeSlicedSurveyResponse extends StellarMessageBase {
  readonly type = "timeSlicedSurveyResponse" as const;
  readonly signedTimeSlicedSurveyResponseMessage: SignedTimeSlicedSurveyResponseMessage;

  constructor(
    signedTimeSlicedSurveyResponseMessage: SignedTimeSlicedSurveyResponseMessage,
  ) {
    super();
    this.signedTimeSlicedSurveyResponseMessage =
      signedTimeSlicedSurveyResponseMessage;
  }

  get value(): SignedTimeSlicedSurveyResponseMessage {
    return this.signedTimeSlicedSurveyResponseMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 22 }> {
    return {
      type: 22,
      signedTimeSlicedSurveyResponseMessage:
        this.signedTimeSlicedSurveyResponseMessage.toXdrObject(),
    };
  }
}

export class StellarMessageTimeSlicedSurveyStartCollecting extends StellarMessageBase {
  readonly type = "timeSlicedSurveyStartCollecting" as const;
  readonly signedTimeSlicedSurveyStartCollectingMessage: SignedTimeSlicedSurveyStartCollectingMessage;

  constructor(
    signedTimeSlicedSurveyStartCollectingMessage: SignedTimeSlicedSurveyStartCollectingMessage,
  ) {
    super();
    this.signedTimeSlicedSurveyStartCollectingMessage =
      signedTimeSlicedSurveyStartCollectingMessage;
  }

  get value(): SignedTimeSlicedSurveyStartCollectingMessage {
    return this.signedTimeSlicedSurveyStartCollectingMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 23 }> {
    return {
      type: 23,
      signedTimeSlicedSurveyStartCollectingMessage:
        this.signedTimeSlicedSurveyStartCollectingMessage.toXdrObject(),
    };
  }
}

export class StellarMessageTimeSlicedSurveyStopCollecting extends StellarMessageBase {
  readonly type = "timeSlicedSurveyStopCollecting" as const;
  readonly signedTimeSlicedSurveyStopCollectingMessage: SignedTimeSlicedSurveyStopCollectingMessage;

  constructor(
    signedTimeSlicedSurveyStopCollectingMessage: SignedTimeSlicedSurveyStopCollectingMessage,
  ) {
    super();
    this.signedTimeSlicedSurveyStopCollectingMessage =
      signedTimeSlicedSurveyStopCollectingMessage;
  }

  get value(): SignedTimeSlicedSurveyStopCollectingMessage {
    return this.signedTimeSlicedSurveyStopCollectingMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 24 }> {
    return {
      type: 24,
      signedTimeSlicedSurveyStopCollectingMessage:
        this.signedTimeSlicedSurveyStopCollectingMessage.toXdrObject(),
    };
  }
}

export class StellarMessageGetScpQuorumset extends StellarMessageBase {
  readonly type = "getScpQuorumset" as const;
  readonly qSetHash: Uint8Array;

  constructor(qSetHash: Uint8Array) {
    super();
    this.qSetHash = qSetHash;
  }

  get value(): Uint8Array {
    return this.qSetHash;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 9 }> {
    return { type: 9, qSetHash: this.qSetHash };
  }
}

export class StellarMessageScpQuorumset extends StellarMessageBase {
  readonly type = "scpQuorumset" as const;
  readonly qSet: ScpQuorumSet;

  constructor(qSet: ScpQuorumSet) {
    super();
    this.qSet = qSet;
  }

  get value(): ScpQuorumSet {
    return this.qSet;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 10 }> {
    return { type: 10, qSet: this.qSet.toXdrObject() };
  }
}

export class StellarMessageScpMessage extends StellarMessageBase {
  readonly type = "scpMessage" as const;
  readonly envelope: ScpEnvelope;

  constructor(envelope: ScpEnvelope) {
    super();
    this.envelope = envelope;
  }

  get value(): ScpEnvelope {
    return this.envelope;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 11 }> {
    return { type: 11, envelope: this.envelope.toXdrObject() };
  }
}

export class StellarMessageGetScpState extends StellarMessageBase {
  readonly type = "getScpState" as const;
  readonly getScpLedgerSeq: number;

  constructor(getScpLedgerSeq: number) {
    super();
    this.getScpLedgerSeq = getScpLedgerSeq;
  }

  get value(): number {
    return this.getScpLedgerSeq;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 12 }> {
    return { type: 12, getScpLedgerSeq: this.getScpLedgerSeq };
  }
}

export class StellarMessageSendMore extends StellarMessageBase {
  readonly type = "sendMore" as const;
  readonly sendMoreMessage: SendMore;

  constructor(sendMoreMessage: SendMore) {
    super();
    this.sendMoreMessage = sendMoreMessage;
  }

  get value(): SendMore {
    return this.sendMoreMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 16 }> {
    return { type: 16, sendMoreMessage: this.sendMoreMessage.toXdrObject() };
  }
}

export class StellarMessageSendMoreExtended extends StellarMessageBase {
  readonly type = "sendMoreExtended" as const;
  readonly sendMoreExtendedMessage: SendMoreExtended;

  constructor(sendMoreExtendedMessage: SendMoreExtended) {
    super();
    this.sendMoreExtendedMessage = sendMoreExtendedMessage;
  }

  get value(): SendMoreExtended {
    return this.sendMoreExtendedMessage;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 20 }> {
    return {
      type: 20,
      sendMoreExtendedMessage: this.sendMoreExtendedMessage.toXdrObject(),
    };
  }
}

export class StellarMessageFloodAdvert extends StellarMessageBase {
  readonly type = "floodAdvert" as const;
  readonly floodAdvert: FloodAdvert;

  constructor(floodAdvert: FloodAdvert) {
    super();
    this.floodAdvert = floodAdvert;
  }

  get value(): FloodAdvert {
    return this.floodAdvert;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 18 }> {
    return { type: 18, floodAdvert: this.floodAdvert.toXdrObject() };
  }
}

export class StellarMessageFloodDemand extends StellarMessageBase {
  readonly type = "floodDemand" as const;
  readonly floodDemand: FloodDemand;

  constructor(floodDemand: FloodDemand) {
    super();
    this.floodDemand = floodDemand;
  }

  get value(): FloodDemand {
    return this.floodDemand;
  }

  toXdrObject(): Extract<StellarMessageWire, { type: 19 }> {
    return { type: 19, floodDemand: this.floodDemand.toXdrObject() };
  }
}

export type StellarMessage =
  | StellarMessageErrorMsg
  | StellarMessageHello
  | StellarMessageAuth
  | StellarMessageDontHave
  | StellarMessagePeers
  | StellarMessageGetTxSet
  | StellarMessageTxSet
  | StellarMessageGeneralizedTxSet
  | StellarMessageTransaction
  | StellarMessageTimeSlicedSurveyRequest
  | StellarMessageTimeSlicedSurveyResponse
  | StellarMessageTimeSlicedSurveyStartCollecting
  | StellarMessageTimeSlicedSurveyStopCollecting
  | StellarMessageGetScpQuorumset
  | StellarMessageScpQuorumset
  | StellarMessageScpMessage
  | StellarMessageGetScpState
  | StellarMessageSendMore
  | StellarMessageSendMoreExtended
  | StellarMessageFloodAdvert
  | StellarMessageFloodDemand;
export const StellarMessage = StellarMessageBase;
