import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScpEnvelope, type ScpEnvelopeWire } from "./scp-envelope.js";

export interface LedgerScpMessagesWire {
  ledgerSeq: number;
  messages: ScpEnvelopeWire[];
}

/**
 * ```xdr
 * struct LedgerSCPMessages
 * {
 *     uint32 ledgerSeq;
 *     SCPEnvelope messages<>;
 * };
 * ```
 */
export class LedgerScpMessages extends XdrValue {
  readonly ledgerSeq: number;
  readonly messages: ScpEnvelope[];

  static readonly schema: XdrType<LedgerScpMessagesWire> = struct(
    "LedgerScpMessages",
    {
      ledgerSeq: uint32(),
      messages: array(ScpEnvelope.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { ledgerSeq: number; messages: ScpEnvelope[] }) {
    super();
    this.ledgerSeq = input.ledgerSeq;
    this.messages = input.messages;
  }

  toXdrObject(): LedgerScpMessagesWire {
    return {
      ledgerSeq: this.ledgerSeq,
      messages: this.messages.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerScpMessagesWire): LedgerScpMessages {
    return new LedgerScpMessages({
      ledgerSeq: wire.ledgerSeq,
      messages: wire.messages.map((w) => ScpEnvelope.fromXdrObject(w)),
    });
  }
}
