import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import { OperationMeta, type OperationMetaWire } from "./operation-meta.js";

export interface TransactionMetaV2Wire {
  txChangesBefore: LedgerEntryChangeWire[];
  operations: OperationMetaWire[];
  txChangesAfter: LedgerEntryChangeWire[];
}

/**
 * ```xdr
 * struct TransactionMetaV2
 * {
 *     LedgerEntryChanges txChangesBefore; // tx level changes before operations
 *                                         // are applied if any
 *     OperationMeta operations<>;         // meta for each operation
 *     LedgerEntryChanges txChangesAfter;  // tx level changes after operations are
 *                                         // applied if any
 * };
 * ```
 */
export class TransactionMetaV2 extends XdrValue {
  readonly txChangesBefore: LedgerEntryChange[];
  readonly operations: OperationMeta[];
  readonly txChangesAfter: LedgerEntryChange[];

  static readonly schema: XdrType<TransactionMetaV2Wire> = struct(
    "TransactionMetaV2",
    {
      txChangesBefore: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      operations: array(OperationMeta.schema, UNBOUNDED_MAX_LENGTH),
      txChangesAfter: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    txChangesBefore: LedgerEntryChange[];
    operations: OperationMeta[];
    txChangesAfter: LedgerEntryChange[];
  }) {
    super();
    this.txChangesBefore = input.txChangesBefore;
    this.operations = input.operations;
    this.txChangesAfter = input.txChangesAfter;
  }

  toXdrObject(): TransactionMetaV2Wire {
    return {
      txChangesBefore: this.txChangesBefore.map((v) => v.toXdrObject()),
      operations: this.operations.map((v) => v.toXdrObject()),
      txChangesAfter: this.txChangesAfter.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionMetaV2Wire): TransactionMetaV2 {
    return new TransactionMetaV2({
      txChangesBefore: wire.txChangesBefore.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      operations: wire.operations.map((w) => OperationMeta.fromXdrObject(w)),
      txChangesAfter: wire.txChangesAfter.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
    });
  }
}
