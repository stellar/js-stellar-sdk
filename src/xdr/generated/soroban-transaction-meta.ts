import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanTransactionMetaExt,
  type SorobanTransactionMetaExtWire,
} from "./soroban-transaction-meta-ext.js";
import { ContractEvent, type ContractEventWire } from "./contract-event.js";
import { ScVal, type ScValWire } from "./sc-val.js";
import {
  DiagnosticEvent,
  type DiagnosticEventWire,
} from "./diagnostic-event.js";

export interface SorobanTransactionMetaWire {
  ext: SorobanTransactionMetaExtWire;
  events: ContractEventWire[];
  returnValue: ScValWire;
  diagnosticEvents: DiagnosticEventWire[];
}

/**
 * ```xdr
 * struct SorobanTransactionMeta
 * {
 *     SorobanTransactionMetaExt ext;
 *
 *     ContractEvent events<>;             // custom events populated by the
 *                                         // contracts themselves.
 *     SCVal returnValue;                  // return value of the host fn invocation
 *
 *     // Diagnostics events that are not hashed.
 *     // This will contain all contract and diagnostic events. Even ones
 *     // that were emitted in a failed contract call.
 *     DiagnosticEvent diagnosticEvents<>;
 * };
 * ```
 */
export class SorobanTransactionMeta extends XdrValue {
  readonly ext: SorobanTransactionMetaExt;
  readonly events: ContractEvent[];
  readonly returnValue: ScVal;
  readonly diagnosticEvents: DiagnosticEvent[];

  static readonly schema: XdrType<SorobanTransactionMetaWire> = struct(
    "SorobanTransactionMeta",
    {
      ext: SorobanTransactionMetaExt.schema,
      events: array(ContractEvent.schema, UNBOUNDED_MAX_LENGTH),
      returnValue: ScVal.schema,
      diagnosticEvents: array(DiagnosticEvent.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: SorobanTransactionMetaExt;
    events: ContractEvent[];
    returnValue: ScVal;
    diagnosticEvents: DiagnosticEvent[];
  }) {
    super();
    this.ext = input.ext;
    this.events = input.events;
    this.returnValue = input.returnValue;
    this.diagnosticEvents = input.diagnosticEvents;
  }

  toXdrObject(): SorobanTransactionMetaWire {
    return {
      ext: this.ext.toXdrObject(),
      events: this.events.map((v) => v.toXdrObject()),
      returnValue: this.returnValue.toXdrObject(),
      diagnosticEvents: this.diagnosticEvents.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: SorobanTransactionMetaWire,
  ): SorobanTransactionMeta {
    return new SorobanTransactionMeta({
      ext: SorobanTransactionMetaExt.fromXdrObject(wire.ext),
      events: wire.events.map((w) => ContractEvent.fromXdrObject(w)),
      returnValue: ScVal.fromXdrObject(wire.returnValue),
      diagnosticEvents: wire.diagnosticEvents.map((w) =>
        DiagnosticEvent.fromXdrObject(w),
      ),
    });
  }
}
