import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionEventStage,
  type TransactionEventStageWire,
} from "./transaction-event-stage.js";
import { ContractEvent, type ContractEventWire } from "./contract-event.js";

export interface TransactionEventWire {
  stage: TransactionEventStageWire;
  event: ContractEventWire;
}

/**
 * ```xdr
 * struct TransactionEvent {
 *     TransactionEventStage stage;  // Stage at which an event has occurred.
 *     ContractEvent event;  // The contract event that has occurred.
 * };
 * ```
 */
export class TransactionEvent extends XdrValue {
  readonly stage: TransactionEventStage;
  readonly event: ContractEvent;

  static readonly schema: XdrType<TransactionEventWire> = struct(
    "TransactionEvent",
    {
      stage: TransactionEventStage.schema,
      event: ContractEvent.schema,
    },
  );

  constructor(input: { stage: TransactionEventStage; event: ContractEvent }) {
    super();
    this.stage = input.stage;
    this.event = input.event;
  }

  toXdrObject(): TransactionEventWire {
    return {
      stage: this.stage.toXdrObject(),
      event: this.event.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionEventWire): TransactionEvent {
    return new TransactionEvent({
      stage: TransactionEventStage.fromXdrObject(wire.stage),
      event: ContractEvent.fromXdrObject(wire.event),
    });
  }
}
