import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type SignatureHintWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque SignatureHint[4];
 * ```
 */
export class SignatureHint extends BytesValue<"SignatureHint"> {
  static readonly byteLength = 4;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(4);

  static fromXdrObject(wire: Uint8Array): SignatureHint {
    return new SignatureHint(wire);
  }
}
