/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { EnvelopeType } from "./envelope-type.js";
import {
  TransactionV0Envelope,
  type TransactionV0EnvelopeWire,
} from "./transaction-v0-envelope.js";
import {
  TransactionV1Envelope,
  type TransactionV1EnvelopeWire,
} from "./transaction-v1-envelope.js";
import {
  FeeBumpTransactionEnvelope,
  type FeeBumpTransactionEnvelopeWire,
} from "./fee-bump-transaction-envelope.js";

export type TransactionEnvelopeWire =
  | { type: 0; v0: TransactionV0EnvelopeWire }
  | { type: 2; v1: TransactionV1EnvelopeWire }
  | { type: 5; feeBump: FeeBumpTransactionEnvelopeWire };

export type TransactionEnvelopeVariantName =
  | "envelopeTypeTxV0"
  | "envelopeTypeTx"
  | "envelopeTypeTxFeeBump";

/**
 * ```xdr
 * union TransactionEnvelope switch (EnvelopeType type)
 * {
 * case ENVELOPE_TYPE_TX_V0:
 *     TransactionV0Envelope v0;
 * case ENVELOPE_TYPE_TX:
 *     TransactionV1Envelope v1;
 * case ENVELOPE_TYPE_TX_FEE_BUMP:
 *     FeeBumpTransactionEnvelope feeBump;
 * };
 * ```
 */
abstract class TransactionEnvelopeBase extends XdrValue {
  abstract readonly type: TransactionEnvelopeVariantName;

  static readonly schema: XdrType<TransactionEnvelopeWire> = union(
    "TransactionEnvelope",
    {
      switchOn: EnvelopeType.schema,
      cases: [
        case_("envelopeTypeTxV0", 0, field("v0", TransactionV0Envelope.schema)),
        case_("envelopeTypeTx", 2, field("v1", TransactionV1Envelope.schema)),
        case_(
          "envelopeTypeTxFeeBump",
          5,
          field("feeBump", FeeBumpTransactionEnvelope.schema),
        ),
      ],
    },
  );

  static envelopeTypeTxV0(v0: TransactionV0Envelope): TransactionEnvelopeTxV0 {
    return new TransactionEnvelopeTxV0(v0);
  }

  static envelopeTypeTx(v1: TransactionV1Envelope): TransactionEnvelopeTx {
    return new TransactionEnvelopeTx(v1);
  }

  static envelopeTypeTxFeeBump(
    feeBump: FeeBumpTransactionEnvelope,
  ): TransactionEnvelopeTxFeeBump {
    return new TransactionEnvelopeTxFeeBump(feeBump);
  }

  static fromXdrObject(wire: TransactionEnvelopeWire): TransactionEnvelope {
    switch (wire.type) {
      case 0:
        return new TransactionEnvelopeTxV0(
          TransactionV0Envelope.fromXdrObject(wire.v0),
        );
      case 2:
        return new TransactionEnvelopeTx(
          TransactionV1Envelope.fromXdrObject(wire.v1),
        );
      case 5:
        return new TransactionEnvelopeTxFeeBump(
          FeeBumpTransactionEnvelope.fromXdrObject(wire.feeBump),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionEnvelope variant.
   * Use this instead of `instanceof TransactionEnvelope`: the exported `TransactionEnvelope` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionEnvelope.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionEnvelope {
    return value instanceof TransactionEnvelopeBase;
  }

  abstract toXdrObject(): TransactionEnvelopeWire;
}

export class TransactionEnvelopeTxV0 extends TransactionEnvelopeBase {
  readonly type = "envelopeTypeTxV0" as const;
  readonly v0: TransactionV0Envelope;

  constructor(v0: TransactionV0Envelope) {
    super();
    this.v0 = v0;
  }

  get value(): TransactionV0Envelope {
    return this.v0;
  }

  toXdrObject(): Extract<TransactionEnvelopeWire, { type: 0 }> {
    return { type: 0, v0: this.v0.toXdrObject() };
  }
}

export class TransactionEnvelopeTx extends TransactionEnvelopeBase {
  readonly type = "envelopeTypeTx" as const;
  readonly v1: TransactionV1Envelope;

  constructor(v1: TransactionV1Envelope) {
    super();
    this.v1 = v1;
  }

  get value(): TransactionV1Envelope {
    return this.v1;
  }

  toXdrObject(): Extract<TransactionEnvelopeWire, { type: 2 }> {
    return { type: 2, v1: this.v1.toXdrObject() };
  }
}

export class TransactionEnvelopeTxFeeBump extends TransactionEnvelopeBase {
  readonly type = "envelopeTypeTxFeeBump" as const;
  readonly feeBump: FeeBumpTransactionEnvelope;

  constructor(feeBump: FeeBumpTransactionEnvelope) {
    super();
    this.feeBump = feeBump;
  }

  get value(): FeeBumpTransactionEnvelope {
    return this.feeBump;
  }

  toXdrObject(): Extract<TransactionEnvelopeWire, { type: 5 }> {
    return { type: 5, feeBump: this.feeBump.toXdrObject() };
  }
}

export type TransactionEnvelope =
  | TransactionEnvelopeTxV0
  | TransactionEnvelopeTx
  | TransactionEnvelopeTxFeeBump;
export const TransactionEnvelope = TransactionEnvelopeBase;
