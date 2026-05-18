import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionResultPair,
  type TransactionResultPairWire,
} from "./transaction-result-pair.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";
import {
  TransactionMeta,
  type TransactionMetaWire,
} from "./transaction-meta.js";

export interface TransactionResultMetaWire {
  result: TransactionResultPairWire;
  feeProcessing: LedgerEntryChangeWire[];
  txApplyProcessing: TransactionMetaWire;
}

/**
 * ```xdr
 * struct TransactionResultMeta
 * {
 *     TransactionResultPair result;
 *     LedgerEntryChanges feeProcessing;
 *     TransactionMeta txApplyProcessing;
 * };
 * ```
 */
export class TransactionResultMeta extends XdrValue {
  readonly result: TransactionResultPair;
  readonly feeProcessing: LedgerEntryChange[];
  readonly txApplyProcessing: TransactionMeta;

  static readonly schema: XdrType<TransactionResultMetaWire> = struct(
    "TransactionResultMeta",
    {
      result: TransactionResultPair.schema,
      feeProcessing: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      txApplyProcessing: TransactionMeta.schema,
    },
  );

  constructor(input: {
    result: TransactionResultPair;
    feeProcessing: LedgerEntryChange[];
    txApplyProcessing: TransactionMeta;
  }) {
    super();
    this.result = input.result;
    this.feeProcessing = input.feeProcessing;
    this.txApplyProcessing = input.txApplyProcessing;
  }

  toXdrObject(): TransactionResultMetaWire {
    return {
      result: this.result.toXdrObject(),
      feeProcessing: this.feeProcessing.map((v) => v.toXdrObject()),
      txApplyProcessing: this.txApplyProcessing.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionResultMetaWire): TransactionResultMeta {
    return new TransactionResultMeta({
      result: TransactionResultPair.fromXdrObject(wire.result),
      feeProcessing: wire.feeProcessing.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      txApplyProcessing: TransactionMeta.fromXdrObject(wire.txApplyProcessing),
    });
  }
}
