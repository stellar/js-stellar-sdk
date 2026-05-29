import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Transaction, type TransactionWire } from "./transaction.js";
import {
  DecoratedSignature,
  type DecoratedSignatureWire,
} from "./decorated-signature.js";

export interface TransactionV1EnvelopeWire {
  tx: TransactionWire;
  signatures: DecoratedSignatureWire[];
}

/**
 * ```xdr
 * struct TransactionV1Envelope
 * {
 *     Transaction tx;
 *     /* Each decorated signature is a signature over the SHA256 hash of
 *      * a TransactionSignaturePayload *\/
 *     DecoratedSignature signatures<20>;
 * };
 * ```
 */
export class TransactionV1Envelope extends XdrValue {
  readonly tx: Transaction;
  readonly signatures: DecoratedSignature[];

  static readonly schema: XdrType<TransactionV1EnvelopeWire> = struct(
    "TransactionV1Envelope",
    {
      tx: Transaction.schema,
      signatures: array(DecoratedSignature.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { tx: Transaction; signatures: DecoratedSignature[] }) {
    super();
    this.tx = input.tx;
    this.signatures = input.signatures;
  }

  toXdrObject(): TransactionV1EnvelopeWire {
    return {
      tx: this.tx.toXdrObject(),
      signatures: this.signatures.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionV1EnvelopeWire): TransactionV1Envelope {
    return new TransactionV1Envelope({
      tx: Transaction.fromXdrObject(wire.tx),
      signatures: wire.signatures.map((w) =>
        DecoratedSignature.fromXdrObject(w),
      ),
    });
  }
}
