import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  TransactionSignaturePayloadTaggedTransaction,
  type TransactionSignaturePayloadTaggedTransactionWire,
} from "./transaction-signature-payload-tagged-transaction.js";

export interface TransactionSignaturePayloadWire {
  networkId: HashWire;
  taggedTransaction: TransactionSignaturePayloadTaggedTransactionWire;
}

/**
 * ```xdr
 * struct TransactionSignaturePayload
 * {
 *     Hash networkId;
 *     union switch (EnvelopeType type)
 *     {
 *     // Backwards Compatibility: Use ENVELOPE_TYPE_TX to sign ENVELOPE_TYPE_TX_V0
 *     case ENVELOPE_TYPE_TX:
 *         Transaction tx;
 *     case ENVELOPE_TYPE_TX_FEE_BUMP:
 *         FeeBumpTransaction feeBump;
 *     }
 *     taggedTransaction;
 * };
 * ```
 */
export class TransactionSignaturePayload extends XdrValue {
  readonly networkId: Hash;
  readonly taggedTransaction: TransactionSignaturePayloadTaggedTransaction;

  static readonly schema: XdrType<TransactionSignaturePayloadWire> = struct(
    "TransactionSignaturePayload",
    {
      networkId: Hash.schema,
      taggedTransaction: TransactionSignaturePayloadTaggedTransaction.schema,
    },
  );

  constructor(input: {
    networkId: Hash | Uint8Array | string;
    taggedTransaction: TransactionSignaturePayloadTaggedTransaction;
  }) {
    super();
    this.networkId =
      input.networkId instanceof Hash
        ? input.networkId
        : new Hash(input.networkId);
    this.taggedTransaction = input.taggedTransaction;
  }

  toXdrObject(): TransactionSignaturePayloadWire {
    return {
      networkId: this.networkId.toXdrObject(),
      taggedTransaction: this.taggedTransaction.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: TransactionSignaturePayloadWire,
  ): TransactionSignaturePayload {
    return new TransactionSignaturePayload({
      networkId: Hash.fromXdrObject(wire.networkId),
      taggedTransaction:
        TransactionSignaturePayloadTaggedTransaction.fromXdrObject(
          wire.taggedTransaction,
        ),
    });
  }
}
