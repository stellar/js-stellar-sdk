import { struct, varOpaque } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export interface SignerKeyEd25519SignedPayloadWire {
  ed25519: Uint256BytesWire;
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
  readonly ed25519: Uint256Bytes;
  readonly payload: Uint8Array;

  static readonly schema: XdrType<SignerKeyEd25519SignedPayloadWire> = struct(
    "SignerKeyEd25519SignedPayload",
    {
      ed25519: Uint256Bytes.schema,
      payload: varOpaque(64),
    },
  );

  constructor(input: {
    ed25519: Uint256Bytes | Uint8Array | string;
    payload: Uint8Array;
  }) {
    super();
    this.ed25519 =
      input.ed25519 instanceof Uint256Bytes
        ? input.ed25519
        : new Uint256Bytes(input.ed25519);
    this.payload = input.payload;
  }

  toXdrObject(): SignerKeyEd25519SignedPayloadWire {
    return {
      ed25519: this.ed25519.toXdrObject(),
      payload: this.payload,
    };
  }

  static fromXdrObject(
    wire: SignerKeyEd25519SignedPayloadWire,
  ): SignerKeyEd25519SignedPayload {
    return new SignerKeyEd25519SignedPayload({
      ed25519: Uint256Bytes.fromXdrObject(wire.ed25519),
      payload: wire.payload,
    });
  }
}
