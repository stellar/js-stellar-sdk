import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import { ContractEvent, type ContractEventWire } from "./contract-event.js";

export interface OperationMetaV2Wire {
  ext: ExtensionPointWire;
  changes: LedgerEntryChangeWire[];
  events: ContractEventWire[];
}

/**
 * ```xdr
 * struct OperationMetaV2
 * {
 *     ExtensionPoint ext;
 *
 *     LedgerEntryChanges changes;
 *
 *     ContractEvent events<>;
 * };
 * ```
 */
export class OperationMetaV2 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly changes: LedgerEntryChange[];
  readonly events: ContractEvent[];

  static readonly schema: XdrType<OperationMetaV2Wire> = struct(
    "OperationMetaV2",
    {
      ext: ExtensionPoint.schema,
      changes: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      events: array(ContractEvent.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    changes: LedgerEntryChange[];
    events: ContractEvent[];
  }) {
    super();
    this.ext = input.ext;
    this.changes = input.changes;
    this.events = input.events;
  }

  toXdrObject(): OperationMetaV2Wire {
    return {
      ext: this.ext.toXdrObject(),
      changes: this.changes.map((v) => v.toXdrObject()),
      events: this.events.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: OperationMetaV2Wire): OperationMetaV2 {
    return new OperationMetaV2({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      changes: wire.changes.map((w) => LedgerEntryChange.fromXdrObject(w)),
      events: wire.events.map((w) => ContractEvent.fromXdrObject(w)),
    });
  }
}
