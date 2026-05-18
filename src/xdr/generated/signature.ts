import { varOpaque } from "../types/var-opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type SignatureWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque Signature<64>;
 * ```
 */
export class Signature extends BytesValue<"Signature"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(64);

  static fromXdrObject(wire: Uint8Array): Signature {
    return new Signature(wire);
  }
}
