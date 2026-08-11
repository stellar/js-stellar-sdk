import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import { OperationMeta, type OperationMetaWire } from "./operation-meta.js";

export interface TransactionMetaV1Wire {
  txChanges: LedgerEntryChangeWire[];
  operations: OperationMetaWire[];
}

/**
 * ```xdr
 * struct TransactionMetaV1
 * {
 *     LedgerEntryChanges txChanges; // tx level changes if any
 *     OperationMeta operations<>;   // meta for each operation
 * };
 * ```
 */
export class TransactionMetaV1 extends XdrValue {
  readonly txChanges: LedgerEntryChange[];
  readonly operations: OperationMeta[];

  static readonly schema: XdrType<TransactionMetaV1Wire> = struct(
    "TransactionMetaV1",
    {
      txChanges: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      operations: array(OperationMeta.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    txChanges: LedgerEntryChange[];
    operations: OperationMeta[];
  }) {
    super();
    this.txChanges = input.txChanges;
    this.operations = input.operations;
  }

  toXdrObject(): TransactionMetaV1Wire {
    return {
      txChanges: this.txChanges.map((v) => v.toXdrObject()),
      operations: this.operations.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionMetaV1Wire): TransactionMetaV1 {
    return new TransactionMetaV1({
      txChanges: wire.txChanges.map((w) => LedgerEntryChange.fromXdrObject(w)),
      operations: wire.operations.map((w) => OperationMeta.fromXdrObject(w)),
    });
  }
}
