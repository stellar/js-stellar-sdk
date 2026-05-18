import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import {
  SurveyMessageCommandType,
  type SurveyMessageCommandTypeWire,
} from "./survey-message-command-type.js";
import { EncryptedBody, type EncryptedBodyWire } from "./encrypted-body.js";

export interface SurveyResponseMessageWire {
  surveyorPeerId: PublicKeyWire;
  surveyedPeerId: PublicKeyWire;
  ledgerNum: number;
  commandType: SurveyMessageCommandTypeWire;
  encryptedBody: EncryptedBodyWire;
}

/**
 * ```xdr
 * struct SurveyResponseMessage
 * {
 *     NodeID surveyorPeerID;
 *     NodeID surveyedPeerID;
 *     uint32 ledgerNum;
 *     SurveyMessageCommandType commandType;
 *     EncryptedBody encryptedBody;
 * };
 * ```
 */
export class SurveyResponseMessage extends XdrValue {
  readonly surveyorPeerId: PublicKey;
  readonly surveyedPeerId: PublicKey;
  readonly ledgerNum: number;
  readonly commandType: SurveyMessageCommandType;
  readonly encryptedBody: EncryptedBody;

  static readonly schema: XdrType<SurveyResponseMessageWire> = struct(
    "SurveyResponseMessage",
    {
      surveyorPeerId: PublicKey.schema,
      surveyedPeerId: PublicKey.schema,
      ledgerNum: uint32(),
      commandType: SurveyMessageCommandType.schema,
      encryptedBody: EncryptedBody.schema,
    },
  );

  constructor(input: {
    surveyorPeerId: PublicKey;
    surveyedPeerId: PublicKey;
    ledgerNum: number;
    commandType: SurveyMessageCommandType;
    encryptedBody: EncryptedBody | Uint8Array | string;
  }) {
    super();
    this.surveyorPeerId = input.surveyorPeerId;
    this.surveyedPeerId = input.surveyedPeerId;
    this.ledgerNum = input.ledgerNum;
    this.commandType = input.commandType;
    this.encryptedBody =
      input.encryptedBody instanceof EncryptedBody
        ? input.encryptedBody
        : new EncryptedBody(input.encryptedBody);
  }

  toXdrObject(): SurveyResponseMessageWire {
    return {
      surveyorPeerId: this.surveyorPeerId.toXdrObject(),
      surveyedPeerId: this.surveyedPeerId.toXdrObject(),
      ledgerNum: this.ledgerNum,
      commandType: this.commandType.toXdrObject(),
      encryptedBody: this.encryptedBody.toXdrObject(),
    };
  }

  static fromXdrObject(wire: SurveyResponseMessageWire): SurveyResponseMessage {
    return new SurveyResponseMessage({
      surveyorPeerId: PublicKey.fromXdrObject(wire.surveyorPeerId),
      surveyedPeerId: PublicKey.fromXdrObject(wire.surveyedPeerId),
      ledgerNum: wire.ledgerNum,
      commandType: SurveyMessageCommandType.fromXdrObject(wire.commandType),
      encryptedBody: EncryptedBody.fromXdrObject(wire.encryptedBody),
    });
  }
}
