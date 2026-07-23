import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
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

export interface TransactionResultMetaV1Wire {
  ext: ExtensionPointWire;
  result: TransactionResultPairWire;
  feeProcessing: LedgerEntryChangeWire[];
  txApplyProcessing: TransactionMetaWire;
  postTxApplyFeeProcessing: LedgerEntryChangeWire[];
}

/**
 * ```xdr
 * struct TransactionResultMetaV1
 * {
 *     ExtensionPoint ext;
 *
 *     TransactionResultPair result;
 *     LedgerEntryChanges feeProcessing;
 *     TransactionMeta txApplyProcessing;
 *
 *     LedgerEntryChanges postTxApplyFeeProcessing;
 * };
 * ```
 */
export class TransactionResultMetaV1 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly result: TransactionResultPair;
  readonly feeProcessing: LedgerEntryChange[];
  readonly txApplyProcessing: TransactionMeta;
  readonly postTxApplyFeeProcessing: LedgerEntryChange[];

  static readonly schema: XdrType<TransactionResultMetaV1Wire> = struct(
    "TransactionResultMetaV1",
    {
      ext: ExtensionPoint.schema,
      result: TransactionResultPair.schema,
      feeProcessing: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
      txApplyProcessing: TransactionMeta.schema,
      postTxApplyFeeProcessing: array(
        LedgerEntryChange.schema,
        UNBOUNDED_MAX_LENGTH,
      ),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    result: TransactionResultPair;
    feeProcessing: LedgerEntryChange[];
    txApplyProcessing: TransactionMeta;
    postTxApplyFeeProcessing: LedgerEntryChange[];
  }) {
    super();
    this.ext = input.ext;
    this.result = input.result;
    this.feeProcessing = input.feeProcessing;
    this.txApplyProcessing = input.txApplyProcessing;
    this.postTxApplyFeeProcessing = input.postTxApplyFeeProcessing;
  }

  toXdrObject(): TransactionResultMetaV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      result: this.result.toXdrObject(),
      feeProcessing: this.feeProcessing.map((v) => v.toXdrObject()),
      txApplyProcessing: this.txApplyProcessing.toXdrObject(),
      postTxApplyFeeProcessing: this.postTxApplyFeeProcessing.map((v) =>
        v.toXdrObject(),
      ),
    };
  }

  static fromXdrObject(
    wire: TransactionResultMetaV1Wire,
  ): TransactionResultMetaV1 {
    return new TransactionResultMetaV1({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      result: TransactionResultPair.fromXdrObject(wire.result),
      feeProcessing: wire.feeProcessing.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
      txApplyProcessing: TransactionMeta.fromXdrObject(wire.txApplyProcessing),
      postTxApplyFeeProcessing: wire.postTxApplyFeeProcessing.map((w) =>
        LedgerEntryChange.fromXdrObject(w),
      ),
    });
  }
}
