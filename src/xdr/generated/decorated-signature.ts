import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SignatureHint, type SignatureHintWire } from "./signature-hint.js";
import { Signature, type SignatureWire } from "./signature.js";

export interface DecoratedSignatureWire {
  hint: SignatureHintWire;
  signature: SignatureWire;
}

/**
 * ```xdr
 * struct DecoratedSignature
 * {
 *     SignatureHint hint;  // last 4 bytes of the public key, used as a hint
 *     Signature signature; // actual signature
 * };
 * ```
 */
export class DecoratedSignature extends XdrValue {
  readonly hint: SignatureHint;
  readonly signature: Signature;

  static readonly schema: XdrType<DecoratedSignatureWire> = struct(
    "DecoratedSignature",
    {
      hint: SignatureHint.schema,
      signature: Signature.schema,
    },
  );

  constructor(input: {
    hint: SignatureHint | Uint8Array | string;
    signature: Signature | Uint8Array | string;
  }) {
    super();
    this.hint =
      input.hint instanceof SignatureHint
        ? input.hint
        : new SignatureHint(input.hint);
    this.signature =
      input.signature instanceof Signature
        ? input.signature
        : new Signature(input.signature);
  }

  toXdrObject(): DecoratedSignatureWire {
    return {
      hint: this.hint.toXdrObject(),
      signature: this.signature.toXdrObject(),
    };
  }

  static fromXdrObject(wire: DecoratedSignatureWire): DecoratedSignature {
    return new DecoratedSignature({
      hint: SignatureHint.fromXdrObject(wire.hint),
      signature: Signature.fromXdrObject(wire.signature),
    });
  }
}
