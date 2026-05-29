import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  FeeBumpTransaction,
  type FeeBumpTransactionWire,
} from "./fee-bump-transaction.js";
import {
  DecoratedSignature,
  type DecoratedSignatureWire,
} from "./decorated-signature.js";

export interface FeeBumpTransactionEnvelopeWire {
  tx: FeeBumpTransactionWire;
  signatures: DecoratedSignatureWire[];
}

/**
 * ```xdr
 * struct FeeBumpTransactionEnvelope
 * {
 *     FeeBumpTransaction tx;
 *     /* Each decorated signature is a signature over the SHA256 hash of
 *      * a TransactionSignaturePayload *\/
 *     DecoratedSignature signatures<20>;
 * };
 * ```
 */
export class FeeBumpTransactionEnvelope extends XdrValue {
  readonly tx: FeeBumpTransaction;
  readonly signatures: DecoratedSignature[];

  static readonly schema: XdrType<FeeBumpTransactionEnvelopeWire> = struct(
    "FeeBumpTransactionEnvelope",
    {
      tx: FeeBumpTransaction.schema,
      signatures: array(DecoratedSignature.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    tx: FeeBumpTransaction;
    signatures: DecoratedSignature[];
  }) {
    super();
    this.tx = input.tx;
    this.signatures = input.signatures;
  }

  toXdrObject(): FeeBumpTransactionEnvelopeWire {
    return {
      tx: this.tx.toXdrObject(),
      signatures: this.signatures.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: FeeBumpTransactionEnvelopeWire,
  ): FeeBumpTransactionEnvelope {
    return new FeeBumpTransactionEnvelope({
      tx: FeeBumpTransaction.fromXdrObject(wire.tx),
      signatures: wire.signatures.map((w) =>
        DecoratedSignature.fromXdrObject(w),
      ),
    });
  }
}
