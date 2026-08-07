import { array, option, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import { OperationMeta, type OperationMetaWire } from "./operation-meta.js";
import {
  SorobanTransactionMeta,
  type SorobanTransactionMetaWire,
} from "./soroban-transaction-meta.js";

export interface TransactionMetaV3Wire {
  ext: ExtensionPointWire;
  txChangesBefore: LedgerEntryChangeWire[];
  operations: OperationMetaWire[];
  txChangesAfter: LedgerEntryChangeWire[];
  sorobanMeta: SorobanTransactionMetaWire | null;
}

/**
 * ```xdr
 * struct TransactionMetaV3
 * {
 *     ExtensionPoint ext;
 *
 *     LedgerEntryChanges txChangesBefore;  // tx level changes before operations
 *                                          // are applied if any
 *     OperationMeta operations<>;          // meta for each operation
 *     LedgerEntryChanges txChangesAfter;   // tx level changes after operations are
 *                                          // applied if any
 *     SorobanTransactionMeta* sorobanMeta; // Soroban-specific meta (only for
 *                                          // Soroban transactions).
 * };
 * ```
 */
export class TransactionMetaV3 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly txChangesBefore: LedgerEntryChange[];
  readonly operations: OperationMeta[];
  readonly txChangesAfter: LedgerEntryChange[];
  readonly sorobanMeta: SorobanTransactionMeta | null;

  static readonly schema: XdrType<TransactionMetaV3Wire> = struct(
    "TransactionMetaV3",
    {
      ext: ExtensionPoint.schema,
      txChangesBefore: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      operations: array(OperationMeta.schema, UNBOUNDED_MAX_LENGTH),
      txChangesAfter: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      sorobanMeta: option(SorobanTransactionMeta.schema),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    txChangesBefore: LedgerEntryChange[];
    operations: OperationMeta[];
    txChangesAfter: LedgerEntryChange[];
    sorobanMeta: SorobanTransactionMeta | null;
  }) {
    super();
    this.ext = input.ext;
    this.txChangesBefore = input.txChangesBefore;
    this.operations = input.operations;
    this.txChangesAfter = input.txChangesAfter;
    this.sorobanMeta = input.sorobanMeta;
  }

  toXdrObject(): TransactionMetaV3Wire {
    return {
      ext: this.ext.toXdrObject(),
      txChangesBefore: this.txChangesBefore.map((v) => v.toXdrObject()),
      operations: this.operations.map((v) => v.toXdrObject()),
      txChangesAfter: this.txChangesAfter.map((v) => v.toXdrObject()),
      sorobanMeta:
        this.sorobanMeta === null ? null : this.sorobanMeta.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionMetaV3Wire): TransactionMetaV3 {
    return new TransactionMetaV3({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      txChangesBefore: wire.txChangesBefore.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      operations: wire.operations.map((w) => OperationMeta.fromXdrObject(w)),
      txChangesAfter: wire.txChangesAfter.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      sorobanMeta:
        wire.sorobanMeta === null
          ? null
          : SorobanTransactionMeta.fromXdrObject(wire.sorobanMeta),
    });
  }
}
