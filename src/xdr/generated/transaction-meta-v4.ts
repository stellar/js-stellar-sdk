import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { option } from "../types/option.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import {
  OperationMetaV2,
  type OperationMetaV2Wire,
} from "./operation-meta-v2.js";
import {
  SorobanTransactionMetaV2,
  type SorobanTransactionMetaV2Wire,
} from "./soroban-transaction-meta-v2.js";
import {
  TransactionEvent,
  type TransactionEventWire,
} from "./transaction-event.js";
import {
  DiagnosticEvent,
  type DiagnosticEventWire,
} from "./diagnostic-event.js";

export interface TransactionMetaV4Wire {
  ext: ExtensionPointWire;
  txChangesBefore: LedgerEntryChangeWire[];
  operations: OperationMetaV2Wire[];
  txChangesAfter: LedgerEntryChangeWire[];
  sorobanMeta: SorobanTransactionMetaV2Wire | null;
  events: TransactionEventWire[];
  diagnosticEvents: DiagnosticEventWire[];
}

/**
 * ```xdr
 * struct TransactionMetaV4
 * {
 *     ExtensionPoint ext;
 *
 *     LedgerEntryChanges txChangesBefore;  // tx level changes before operations
 *                                          // are applied if any
 *     OperationMetaV2 operations<>;        // meta for each operation
 *     LedgerEntryChanges txChangesAfter;   // tx level changes after operations are
 *                                          // applied if any
 *     SorobanTransactionMetaV2* sorobanMeta; // Soroban-specific meta (only for
 *                                            // Soroban transactions).
 *
 *     TransactionEvent events<>; // Used for transaction-level events (like fee payment)
 *     DiagnosticEvent diagnosticEvents<>; // Used for all diagnostic information
 * };
 * ```
 */
export class TransactionMetaV4 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly txChangesBefore: LedgerEntryChange[];
  readonly operations: OperationMetaV2[];
  readonly txChangesAfter: LedgerEntryChange[];
  readonly sorobanMeta: SorobanTransactionMetaV2 | null;
  readonly events: TransactionEvent[];
  readonly diagnosticEvents: DiagnosticEvent[];

  static readonly schema: XdrType<TransactionMetaV4Wire> = struct(
    "TransactionMetaV4",
    {
      ext: ExtensionPoint.schema,
      txChangesBefore: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      operations: array(OperationMetaV2.schema, UNBOUNDED_MAX_LENGTH),
      txChangesAfter: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      sorobanMeta: option(SorobanTransactionMetaV2.schema),
      events: array(TransactionEvent.schema, UNBOUNDED_MAX_LENGTH),
      diagnosticEvents: array(DiagnosticEvent.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    txChangesBefore: LedgerEntryChange[];
    operations: OperationMetaV2[];
    txChangesAfter: LedgerEntryChange[];
    sorobanMeta: SorobanTransactionMetaV2 | null;
    events: TransactionEvent[];
    diagnosticEvents: DiagnosticEvent[];
  }) {
    super();
    this.ext = input.ext;
    this.txChangesBefore = input.txChangesBefore;
    this.operations = input.operations;
    this.txChangesAfter = input.txChangesAfter;
    this.sorobanMeta = input.sorobanMeta;
    this.events = input.events;
    this.diagnosticEvents = input.diagnosticEvents;
  }

  toXdrObject(): TransactionMetaV4Wire {
    return {
      ext: this.ext.toXdrObject(),
      txChangesBefore: this.txChangesBefore.map((v) => v.toXdrObject()),
      operations: this.operations.map((v) => v.toXdrObject()),
      txChangesAfter: this.txChangesAfter.map((v) => v.toXdrObject()),
      sorobanMeta:
        this.sorobanMeta === null ? null : this.sorobanMeta.toXdrObject(),
      events: this.events.map((v) => v.toXdrObject()),
      diagnosticEvents: this.diagnosticEvents.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionMetaV4Wire): TransactionMetaV4 {
    return new TransactionMetaV4({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      txChangesBefore: wire.txChangesBefore.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      operations: wire.operations.map((w) => OperationMetaV2.fromXdrObject(w)),
      txChangesAfter: wire.txChangesAfter.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      sorobanMeta:
        wire.sorobanMeta === null
          ? null
          : SorobanTransactionMetaV2.fromXdrObject(wire.sorobanMeta),
      events: wire.events.map((w) => TransactionEvent.fromXdrObject(w)),
      diagnosticEvents: wire.diagnosticEvents.map((w) =>
        DiagnosticEvent.fromXdrObject(w),
      ),
    });
  }
}
