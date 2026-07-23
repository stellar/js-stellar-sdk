import { array, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { TransactionV0, type TransactionV0Wire } from "./transaction-v0.js";
import {
  DecoratedSignature,
  type DecoratedSignatureWire,
} from "./decorated-signature.js";

export interface TransactionV0EnvelopeWire {
  tx: TransactionV0Wire;
  signatures: DecoratedSignatureWire[];
}

/**
 * ```xdr
 * struct TransactionV0Envelope
 * {
 *     TransactionV0 tx;
 *     /* Each decorated signature is a signature over the SHA256 hash of
 *      * a TransactionSignaturePayload *\/
 *     DecoratedSignature signatures<20>;
 * };
 * ```
 */
export class TransactionV0Envelope extends XdrValue {
  readonly tx: TransactionV0;
  readonly signatures: DecoratedSignature[];

  static readonly schema: XdrType<TransactionV0EnvelopeWire> = struct(
    "TransactionV0Envelope",
    {
      tx: TransactionV0.schema,
      signatures: array(DecoratedSignature.schema, 20),
    },
  );

  constructor(input: { tx: TransactionV0; signatures: DecoratedSignature[] }) {
    super();
    this.tx = input.tx;
    this.signatures = input.signatures;
  }

  toXdrObject(): TransactionV0EnvelopeWire {
    return {
      tx: this.tx.toXdrObject(),
      signatures: this.signatures.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionV0EnvelopeWire): TransactionV0Envelope {
    return new TransactionV0Envelope({
      tx: TransactionV0.fromXdrObject(wire.tx),
      signatures: wire.signatures.map((w) =>
        DecoratedSignature.fromXdrObject(w),
      ),
    });
  }
}
