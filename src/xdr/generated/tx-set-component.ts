/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { TxSetComponentType } from "./tx-set-component-type.js";
import {
  TxSetComponentTxsMaybeDiscountedFee,
  type TxSetComponentTxsMaybeDiscountedFeeWire,
} from "./tx-set-component-txs-maybe-discounted-fee.js";

export type TxSetComponentWire = {
  type: 0;
  txsMaybeDiscountedFee: TxSetComponentTxsMaybeDiscountedFeeWire;
};

export type TxSetComponentVariantName = "txsetCompTxsMaybeDiscountedFee";

/**
 * ```xdr
 * union TxSetComponent switch (TxSetComponentType type)
 * {
 * case TXSET_COMP_TXS_MAYBE_DISCOUNTED_FEE:
 *   struct
 *   {
 *     int64* baseFee;
 *     TransactionEnvelope txs<>;
 *   } txsMaybeDiscountedFee;
 * };
 * ```
 */
abstract class TxSetComponentBase extends XdrValue {
  abstract readonly type: TxSetComponentVariantName;

  static readonly schema: XdrType<TxSetComponentWire> = union(
    "TxSetComponent",
    {
      switchOn: TxSetComponentType.schema,
      cases: [
        case_(
          "txsetCompTxsMaybeDiscountedFee",
          0,
          field(
            "txsMaybeDiscountedFee",
            TxSetComponentTxsMaybeDiscountedFee.schema,
          ),
        ),
      ],
    },
  );

  static txsetCompTxsMaybeDiscountedFee(
    txsMaybeDiscountedFee: TxSetComponentTxsMaybeDiscountedFee,
  ): TxSetComponentTxsetCompTxsMaybeDiscountedFee {
    return new TxSetComponentTxsetCompTxsMaybeDiscountedFee(
      txsMaybeDiscountedFee,
    );
  }

  static fromXdrObject(wire: TxSetComponentWire): TxSetComponent {
    switch (wire.type) {
      case 0:
        return new TxSetComponentTxsetCompTxsMaybeDiscountedFee(
          TxSetComponentTxsMaybeDiscountedFee.fromXdrObject(
            wire.txsMaybeDiscountedFee,
          ),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TxSetComponent variant.
   * Use this instead of `instanceof TxSetComponent`: the exported `TxSetComponent` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TxSetComponent.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TxSetComponent {
    return value instanceof TxSetComponentBase;
  }

  abstract toXdrObject(): TxSetComponentWire;
}

export class TxSetComponentTxsetCompTxsMaybeDiscountedFee extends TxSetComponentBase {
  readonly type = "txsetCompTxsMaybeDiscountedFee" as const;
  readonly txsMaybeDiscountedFee: TxSetComponentTxsMaybeDiscountedFee;

  constructor(txsMaybeDiscountedFee: TxSetComponentTxsMaybeDiscountedFee) {
    super();
    this.txsMaybeDiscountedFee = txsMaybeDiscountedFee;
  }

  get value(): TxSetComponentTxsMaybeDiscountedFee {
    return this.txsMaybeDiscountedFee;
  }

  toXdrObject(): Extract<TxSetComponentWire, { type: 0 }> {
    return {
      type: 0,
      txsMaybeDiscountedFee: this.txsMaybeDiscountedFee.toXdrObject(),
    };
  }
}

export type TxSetComponent = TxSetComponentTxsetCompTxsMaybeDiscountedFee;
export const TxSetComponent = TxSetComponentBase;
