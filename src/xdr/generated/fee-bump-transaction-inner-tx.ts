/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { EnvelopeType } from "./envelope-type.js";
import {
  TransactionV1Envelope,
  type TransactionV1EnvelopeWire,
} from "./transaction-v1-envelope.js";

export type FeeBumpTransactionInnerTxWire = {
  type: 2;
  v1: TransactionV1EnvelopeWire;
};

export type FeeBumpTransactionInnerTxVariantName = "envelopeTypeTx";

/**
 * ```xdr
 * union switch (EnvelopeType type)
 *     {
 *     case ENVELOPE_TYPE_TX:
 *         TransactionV1Envelope v1;
 *     }
 * ```
 */
abstract class FeeBumpTransactionInnerTxBase extends XdrValue {
  abstract readonly type: FeeBumpTransactionInnerTxVariantName;

  static readonly schema: XdrType<FeeBumpTransactionInnerTxWire> = union(
    "FeeBumpTransactionInnerTx",
    {
      switchOn: EnvelopeType.schema,
      cases: [
        case_("envelopeTypeTx", 2, field("v1", TransactionV1Envelope.schema)),
      ],
    },
  );

  static envelopeTypeTx(
    v1: TransactionV1Envelope,
  ): FeeBumpTransactionInnerTxTx {
    return new FeeBumpTransactionInnerTxTx(v1);
  }

  static fromXdrObject(
    wire: FeeBumpTransactionInnerTxWire,
  ): FeeBumpTransactionInnerTx {
    switch (wire.type) {
      case 2:
        return new FeeBumpTransactionInnerTxTx(
          TransactionV1Envelope.fromXdrObject(wire.v1),
        );
    }
  }

  abstract toXdrObject(): FeeBumpTransactionInnerTxWire;
}

export class FeeBumpTransactionInnerTxTx extends FeeBumpTransactionInnerTxBase {
  readonly type = "envelopeTypeTx" as const;
  readonly v1: TransactionV1Envelope;

  constructor(v1: TransactionV1Envelope) {
    super();
    this.v1 = v1;
  }

  get value(): TransactionV1Envelope {
    return this.v1;
  }

  toXdrObject(): Extract<FeeBumpTransactionInnerTxWire, { type: 2 }> {
    return { type: 2, v1: this.v1.toXdrObject() };
  }
}

export type FeeBumpTransactionInnerTx = FeeBumpTransactionInnerTxTx;
export const FeeBumpTransactionInnerTx = FeeBumpTransactionInnerTxBase;
