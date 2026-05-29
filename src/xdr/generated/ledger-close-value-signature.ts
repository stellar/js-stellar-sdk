import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Signature, type SignatureWire } from "./signature.js";

export interface LedgerCloseValueSignatureWire {
  nodeId: PublicKeyWire;
  signature: SignatureWire;
}

/**
 * ```xdr
 * struct LedgerCloseValueSignature
 * {
 *     NodeID nodeID;       // which node introduced the value
 *     Signature signature; // nodeID's signature
 * };
 * ```
 */
export class LedgerCloseValueSignature extends XdrValue {
  readonly nodeId: PublicKey;
  readonly signature: Signature;

  static readonly schema: XdrType<LedgerCloseValueSignatureWire> = struct(
    "LedgerCloseValueSignature",
    {
      nodeId: PublicKey.schema,
      signature: Signature.schema,
    },
  );

  constructor(input: {
    nodeId: PublicKey;
    signature: Signature | Uint8Array | string;
  }) {
    super();
    this.nodeId = input.nodeId;
    this.signature =
      input.signature instanceof Signature
        ? input.signature
        : new Signature(input.signature);
  }

  toXdrObject(): LedgerCloseValueSignatureWire {
    return {
      nodeId: this.nodeId.toXdrObject(),
      signature: this.signature.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerCloseValueSignatureWire,
  ): LedgerCloseValueSignature {
    return new LedgerCloseValueSignature({
      nodeId: PublicKey.fromXdrObject(wire.nodeId),
      signature: Signature.fromXdrObject(wire.signature),
    });
  }
}
