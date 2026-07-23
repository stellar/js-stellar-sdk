import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import {
  Curve25519Public,
  type Curve25519PublicWire,
} from "./curve25519-public.js";
import {
  SurveyMessageCommandType,
  type SurveyMessageCommandTypeWire,
} from "./survey-message-command-type.js";

export interface SurveyRequestMessageWire {
  surveyorPeerId: PublicKeyWire;
  surveyedPeerId: PublicKeyWire;
  ledgerNum: number;
  encryptionKey: Curve25519PublicWire;
  commandType: SurveyMessageCommandTypeWire;
}

/**
 * ```xdr
 * struct SurveyRequestMessage
 * {
 *     NodeID surveyorPeerID;
 *     NodeID surveyedPeerID;
 *     uint32 ledgerNum;
 *     Curve25519Public encryptionKey;
 *     SurveyMessageCommandType commandType;
 * };
 * ```
 */
export class SurveyRequestMessage extends XdrValue {
  readonly surveyorPeerId: PublicKey;
  readonly surveyedPeerId: PublicKey;
  readonly ledgerNum: number;
  readonly encryptionKey: Curve25519Public;
  readonly commandType: SurveyMessageCommandType;

  static readonly schema: XdrType<SurveyRequestMessageWire> = struct(
    "SurveyRequestMessage",
    {
      surveyorPeerId: PublicKey.schema,
      surveyedPeerId: PublicKey.schema,
      ledgerNum: uint32(),
      encryptionKey: Curve25519Public.schema,
      commandType: SurveyMessageCommandType.schema,
    },
  );

  constructor(input: {
    surveyorPeerId: PublicKey;
    surveyedPeerId: PublicKey;
    ledgerNum: number;
    encryptionKey: Curve25519Public;
    commandType: SurveyMessageCommandType;
  }) {
    super();
    this.surveyorPeerId = input.surveyorPeerId;
    this.surveyedPeerId = input.surveyedPeerId;
    this.ledgerNum = input.ledgerNum;
    this.encryptionKey = input.encryptionKey;
    this.commandType = input.commandType;
  }

  toXdrObject(): SurveyRequestMessageWire {
    return {
      surveyorPeerId: this.surveyorPeerId.toXdrObject(),
      surveyedPeerId: this.surveyedPeerId.toXdrObject(),
      ledgerNum: this.ledgerNum,
      encryptionKey: this.encryptionKey.toXdrObject(),
      commandType: this.commandType.toXdrObject(),
    };
  }

  static fromXdrObject(wire: SurveyRequestMessageWire): SurveyRequestMessage {
    return new SurveyRequestMessage({
      surveyorPeerId: PublicKey.fromXdrObject(wire.surveyorPeerId),
      surveyedPeerId: PublicKey.fromXdrObject(wire.surveyedPeerId),
      ledgerNum: wire.ledgerNum,
      encryptionKey: Curve25519Public.fromXdrObject(wire.encryptionKey),
      commandType: SurveyMessageCommandType.fromXdrObject(wire.commandType),
    });
  }
}
