import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";

export interface OperationMetaWire {
  changes: LedgerEntryChangeWire[];
}

/**
 * ```xdr
 * struct OperationMeta
 * {
 *     LedgerEntryChanges changes;
 * };
 * ```
 */
export class OperationMeta extends XdrValue {
  readonly changes: LedgerEntryChange[];

  static readonly schema: XdrType<OperationMetaWire> = struct("OperationMeta", {
    changes: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
  });

  constructor(input: { changes: LedgerEntryChange[] }) {
    super();
    this.changes = input.changes;
  }

  toXdrObject(): OperationMetaWire {
    return {
      changes: this.changes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: OperationMetaWire): OperationMeta {
    return new OperationMeta({
      changes: wire.changes.map((w) => LedgerEntryChange.fromXdrObject(w)),
    });
  }
}
