import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScpQuorumSet, type ScpQuorumSetWire } from "./scp-quorum-set.js";
import {
  LedgerScpMessages,
  type LedgerScpMessagesWire,
} from "./ledger-scp-messages.js";

export interface ScpHistoryEntryV0Wire {
  quorumSets: ScpQuorumSetWire[];
  ledgerMessages: LedgerScpMessagesWire;
}

/**
 * ```xdr
 * struct SCPHistoryEntryV0
 * {
 *     SCPQuorumSet quorumSets<>; // additional quorum sets used by ledgerMessages
 *     LedgerSCPMessages ledgerMessages;
 * };
 * ```
 */
export class ScpHistoryEntryV0 extends XdrValue {
  readonly quorumSets: ScpQuorumSet[];
  readonly ledgerMessages: LedgerScpMessages;

  static readonly schema: XdrType<ScpHistoryEntryV0Wire> = struct(
    "ScpHistoryEntryV0",
    {
      quorumSets: array(ScpQuorumSet.schema, UNBOUNDED_MAX_LENGTH),
      ledgerMessages: LedgerScpMessages.schema,
    },
  );

  constructor(input: {
    quorumSets: ScpQuorumSet[];
    ledgerMessages: LedgerScpMessages;
  }) {
    super();
    this.quorumSets = input.quorumSets;
    this.ledgerMessages = input.ledgerMessages;
  }

  toXdrObject(): ScpHistoryEntryV0Wire {
    return {
      quorumSets: this.quorumSets.map((v) => v.toXdrObject()),
      ledgerMessages: this.ledgerMessages.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScpHistoryEntryV0Wire): ScpHistoryEntryV0 {
    return new ScpHistoryEntryV0({
      quorumSets: wire.quorumSets.map((w) => ScpQuorumSet.fromXdrObject(w)),
      ledgerMessages: LedgerScpMessages.fromXdrObject(wire.ledgerMessages),
    });
  }
}
