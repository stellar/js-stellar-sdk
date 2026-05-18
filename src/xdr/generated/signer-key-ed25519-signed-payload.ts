import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import { varOpaque } from "../types/var-opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface SignerKeyEd25519SignedPayloadWire {
  ed25519: Uint8Array;
  payload: Uint8Array;
}

/**
 * ```xdr
 * struct
 *     {
 *         /* Public key that must sign the payload. *\/
 *         uint256 ed25519;
 *         /* Payload to be raw signed by ed25519. *\/
 *         opaque payload<64>;
 *     }
 * ```
 */
export class SignerKeyEd25519SignedPayload extends XdrValue {
  readonly ed25519: Uint8Array;
  readonly payload: Uint8Array;

  static readonly schema: XdrType<SignerKeyEd25519SignedPayloadWire> = struct(
    "SignerKeyEd25519SignedPayload",
    {
      ed25519: opaque(32),
      payload: varOpaque(64),
    },
  );

  constructor(input: { ed25519: Uint8Array; payload: Uint8Array }) {
    super();
    this.ed25519 = input.ed25519;
    this.payload = input.payload;
  }

  toXdrObject(): SignerKeyEd25519SignedPayloadWire {
    return {
      ed25519: this.ed25519,
      payload: this.payload,
    };
  }

  static fromXdrObject(
    wire: SignerKeyEd25519SignedPayloadWire,
  ): SignerKeyEd25519SignedPayload {
    return new SignerKeyEd25519SignedPayload({
      ed25519: wire.ed25519,
      payload: wire.payload,
    });
  }
}
