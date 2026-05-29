import { struct } from "../types/struct.js";
import { bool } from "../types/bool.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ContractEvent, type ContractEventWire } from "./contract-event.js";

export interface DiagnosticEventWire {
  inSuccessfulContractCall: boolean;
  event: ContractEventWire;
}

/**
 * ```xdr
 * struct DiagnosticEvent
 * {
 *     bool inSuccessfulContractCall;
 *     ContractEvent event;
 * };
 * ```
 */
export class DiagnosticEvent extends XdrValue {
  readonly inSuccessfulContractCall: boolean;
  readonly event: ContractEvent;

  static readonly schema: XdrType<DiagnosticEventWire> = struct(
    "DiagnosticEvent",
    {
      inSuccessfulContractCall: bool(),
      event: ContractEvent.schema,
    },
  );

  constructor(input: {
    inSuccessfulContractCall: boolean;
    event: ContractEvent;
  }) {
    super();
    this.inSuccessfulContractCall = input.inSuccessfulContractCall;
    this.event = input.event;
  }

  toXdrObject(): DiagnosticEventWire {
    return {
      inSuccessfulContractCall: this.inSuccessfulContractCall,
      event: this.event.toXdrObject(),
    };
  }

  static fromXdrObject(wire: DiagnosticEventWire): DiagnosticEvent {
    return new DiagnosticEvent({
      inSuccessfulContractCall: wire.inSuccessfulContractCall,
      event: ContractEvent.fromXdrObject(wire.event),
    });
  }
}
