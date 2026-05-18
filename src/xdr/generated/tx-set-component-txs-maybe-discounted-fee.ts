import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import { int64 } from "../types/int64.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionEnvelope,
  type TransactionEnvelopeWire,
} from "./transaction-envelope.js";

export interface TxSetComponentTxsMaybeDiscountedFeeWire {
  baseFee: bigint | null;
  txs: TransactionEnvelopeWire[];
}

/**
 * ```xdr
 * struct
 *   {
 *     int64* baseFee;
 *     TransactionEnvelope txs<>;
 *   }
 * ```
 */
export class TxSetComponentTxsMaybeDiscountedFee extends XdrValue {
  readonly baseFee: bigint | null;
  readonly txs: TransactionEnvelope[];

  static readonly schema: XdrType<TxSetComponentTxsMaybeDiscountedFeeWire> =
    struct("TxSetComponentTxsMaybeDiscountedFee", {
      baseFee: option(int64()),
      txs: array(TransactionEnvelope.schema, UNBOUNDED_MAX_LENGTH),
    });

  constructor(input: { baseFee: bigint | null; txs: TransactionEnvelope[] }) {
    super();
    this.baseFee = input.baseFee;
    this.txs = input.txs;
  }

  toXdrObject(): TxSetComponentTxsMaybeDiscountedFeeWire {
    return {
      baseFee: this.baseFee,
      txs: this.txs.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: TxSetComponentTxsMaybeDiscountedFeeWire,
  ): TxSetComponentTxsMaybeDiscountedFee {
    return new TxSetComponentTxsMaybeDiscountedFee({
      baseFee: wire.baseFee,
      txs: wire.txs.map((w) => TransactionEnvelope.fromXdrObject(w)),
    });
  }
}
